import { Injectable, Inject, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import axios from "axios"
import { SendQueryResponseMistralDTO } from "./dto/send-query-response-mistral.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiHistory } from "../ai_history/entities/ai_history.entity";
import { User } from "../users/entities/user.entity";
import { AiHistoryService } from "../ai_history/ai_history.service";
import { Process } from "../process/entities/process.entity";
import { Step } from "../steps/entities/step.entity";

@Injectable()
export class AiService {
    constructor(
        @InjectRepository(AiHistory)
        private aiHistoryRepository: Repository<AiHistory>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        private readonly aiHistoryService: AiHistoryService,

        @InjectRepository(Process)
        private processRepository: Repository<Process>,

        @InjectRepository(Step)
        private stepRepository: Repository<Step>,

        @Inject('AI_URL')
        private aiUrl: string,
    ) {}

    async sendQuery(prompt: string, collection_name: string, user_id: number): Promise<SendQueryResponseMistralDTO> {
        try {
            let ai_history = await this.aiHistoryRepository.findOneBy({ user: { id: user_id } });
            if (!ai_history) {
                const user = await this.userRepository.findOneBy({ id: user_id });
                if (!user) {
                    throw new Error("User not found");
                }
            }

            const response = await axios.post("http://127.0.0.1:8083/ia/request", {
                "user_input": prompt,
                "collection_name": collection_name,
                "history": ai_history.history
            });
            
            let responseData = null;
            try {
                responseData = {
                    is_roadmap: response.data.is_roadmap,
                    collection_name: collection_name,
                    response: response.data.question,
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la réponse:", error);
                responseData = {
                    is_roadmap: response.data.is_roadmap,
                    roadmap: response.data.roadmap,
                };
            }

            if (responseData.is_roadmap == false) {
                const createHistoryDTO = {
                    history: "Answer: " + prompt + "\n Question: " + responseData.response,
                    userId: user_id
                };

                await this.aiHistoryService.appendToHistory(createHistoryDTO);
            }

            if (responseData.is_roadmap) {
                await this.aiHistoryRepository.delete({ user: { id: user_id } });
        
                const roadmap = response.data.roadmap;

                const process = this.processRepository.create({
                    name: roadmap.name,
                    description: roadmap.description,
                    user: { id: user_id },
                });
                await this.processRepository.save(process);

                for (const step of roadmap.steps) {
                    const stepEntity = this.stepRepository.create({
                        name: step.name,
                        description: step.description,
                        process: process,
                    });
                    await this.stepRepository.save(stepEntity);
                }
            }
            return responseData;
        } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
            throw new Error("Erreur de communication avec le service IA");
        }
    }

    async startConversation(user_id: number, collection_name: string): Promise<SendQueryResponseMistralDTO> {
        try {
            let ai_history = await this.aiHistoryRepository.findOneBy({ user: { id: user_id } });

            const response = await axios.post("http://127.0.0.1:8083/ia/start-conversation", {
                "collection_name": collection_name
            });

            if (!ai_history) {
                const user = await this.userRepository.findOneBy({ id: user_id });
                if (!user) {
                    throw new Error("User not found");
                }

                ai_history = this.aiHistoryRepository.create({
                    history: "Question: " + response.data.question,
                    user: user
                });
                await this.aiHistoryRepository.save(ai_history);
            }
    
            return { is_roadmap: false, collection_name: collection_name, response: response.data.question };
        } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
            throw new Error("Erreur de communication avec le service IA");
        }
    }

    async query(prompt: string, model: string, userId: number): Promise<string> {
        if (!prompt || !model || !userId) {
            throw new BadRequestException("Prompt, model and userId are required");
        }
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new BadRequestException("OPENAI_API_KEY is not set");
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const history = await this.aiHistoryRepository.find({
            where: { user: { id: userId }, uuid: user.uuid },
            order: { id: 'DESC' },
            take: 5,
        });

        const messages = history
            .reverse()
            .map((entry) => ({
                role: "user",
                content: entry.history,
            }));

        messages.push({ role: "user", content: prompt });

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: model,
                    messages: messages,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                }
            );

            if (
                response.data &&
                response.data.choices &&
                response.data.choices.length > 0 &&
                response.data.choices[0].message &&
                response.data.choices[0].message.content
            ) {
                const aiResponse = response.data.choices[0].message.content;

                const newHistory = this.aiHistoryRepository.create({
                    history: `User: ${prompt}\nAI: ${aiResponse}`,
                    user: user,
                    uuid: user.uuid,
                });
                await this.aiHistoryRepository.save(newHistory);

                const allHistory = await this.aiHistoryRepository.find({
                    where: { user: { id: userId }, uuid: user.uuid },
                    order: { id: 'DESC' },
                });
                if (allHistory.length > 5) {
                    const idsToDelete = allHistory.slice(5).map((h) => h.id);
                    await this.aiHistoryRepository.delete(idsToDelete);
                }

                return aiResponse;
            } else {
                throw new BadRequestException("Invalid response from OpenAI API");
            }
        } catch (error) {
            console.error("Error during API call:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw new BadRequestException(
                    error.response.data?.error?.message || "Error communicating with the AI service"
                );
            }
            throw new InternalServerErrorException("Erreur interne du serveur lors de la communication avec le service IA");
        }
    }

    async queryRoadmap(prompt: string, user_Id: number, process_id: number): Promise<any> {
        if (!prompt) {
            throw new BadRequestException("Prompt is required");
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new BadRequestException("OPENAI_API_KEY is not set");
        }

        try {
            const process = await this.processRepository.findOne({
                where: { id: process_id },
                relations: ['steps'],
            });

            if (!process) {
                throw new NotFoundException(`Process with ID ${process_id} not found`);
            }

            const history = await this.aiHistoryRepository.find({
                where: { uuid: process.uuid, user: { id: user_Id } },
                order: { id: 'DESC' },
                take: 10,
            });

            const messages = history.reverse().map((entry) => ({
                role: "user",
                content: entry.history,
            }));

            const context = `
                You are an assistant helping to edit a roadmap. The roadmap is structured as follows:
                - Process Name: ${process.name}
                - Description: ${process.description}
                - Current Steps: ${process.steps.map(step => `name: ${step.name}, description: ${step.description}, processId: ${process.id}`).join('\n')}

                Your task is to identify steps to modify, add, or remove, and if necessary, ask questions to clarify the user's needs.
                If the user requests to remove a step, you must always ask for confirmation before actually removing it. 
                For example, if the user says to delete a step, respond with isAsking: true, roadmap: null, and a question confirming if they are sure about deleting that step.

                Once all questions are answered, generate a JSON object with the updated roadmap structure.

                Important: Always respond with a valid JSON object with the following structure:
                {
                  "isAsking": boolean, // true if you are asking a question, false if you are returning the roadmap
                  "roadmap": object|null, // the updated roadmap object if available, otherwise null
                  "question": string|null // the question you want to ask the user, otherwise null
                }
                If you need to ask a question, set isAsking to true, roadmap to null, and provide your question in the question field.
                If you are returning the roadmap, set isAsking to false, roadmap to the updated roadmap, and question to null.
                Do not include any text outside of the JSON object.

                Example of a valid response (You need to respect the structure):
                {
                  "isAsking": false,
                  "roadmap": {
                    "name": "Updated Process Name",
                    "description": "Updated description",
                    "steps": [
                      {
                        "name": "Step 1",
                        "description": "Description of step 1"
                      },
                      {
                        "name": "Step 2",
                        "description": "Description of step 2"
                      }
                    ]
                  },
                  "question": null
                }
            `;
            messages.unshift({ role: "system", content: context });
            messages.push({ role: "user", content: prompt });

            console.log("Messages sent to AI:", messages);
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o",
                    messages: messages,
                    response_format: {
                        type: "json_schema",
                        json_schema: {
                            name: "roadmap_response",
                            schema: {
                                type: "object",
                                properties: {
                                    isAsking: { type: "boolean" },
                                    roadmap: {
                                        type: ["object", "null"],
                                        properties: {
                                            name: { type: "string" },
                                            description: { type: "string" },
                                            steps: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        name: { type: "string" },
                                                        description: { type: "string" }
                                                    },
                                                    required: ["name", "description"],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: ["name", "description", "steps"],
                                        additionalProperties: false
                                    },
                                    question: { type: ["string", "null"] }
                                },
                                required: ["isAsking", "roadmap", "question"],
                                additionalProperties: false
                            },
                            strict: true
                        }
                    }
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                }
            );

            console.log("AI Response:", response.data);
            if (
                response.data &&
                response.data.choices &&
                response.data.choices.length > 0 &&
                response.data.choices[0].message &&
                response.data.choices[0].message.content
            ) {
                const aiResponse = response.data.choices[0].message.content.trim();

                let parsed: any;
                try {
                    console.log("Raw AI Response:", aiResponse);
                    parsed = JSON.parse(aiResponse);
                } catch (e) {
                    try {
                        const jsonStart = aiResponse.indexOf('{');
                        const jsonEnd = aiResponse.lastIndexOf('}');
                        const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
                        parsed = JSON.parse(jsonString);
                    } catch (err) {
                        throw new BadRequestException("AI response is not a valid JSON object");
                    }
                }

                if (
                    typeof parsed.isAsking !== "boolean" ||
                    (!parsed.isAsking && !parsed.roadmap) ||
                    (parsed.isAsking && !parsed.question)
                ) {
                    throw new BadRequestException("AI response JSON does not have the required structure");
                }

                const newHistory = this.aiHistoryRepository.create({
                    history: `User: ${prompt}\nAI: ${aiResponse}`,
                    user: { id: user_Id },
                    uuid: process.uuid,
                });
                await this.aiHistoryRepository.save(newHistory);

                const allHistory = await this.aiHistoryRepository.find({
                    where: { uuid: process.uuid, user: { id: user_Id } },
                    order: { id: 'DESC' },
                });
                if (allHistory.length > 10) {
                    const idsToDelete = allHistory.slice(10).map((h) => h.id);
                    await this.aiHistoryRepository.delete(idsToDelete);
                }

                console.log("Parsed AI Response:", parsed);
                if (!parsed.isAsking && parsed.isAsking == false && parsed.roadmap) {
                    await this.updateProcessAndSteps(process_id, parsed.roadmap);
                }

                return parsed;
            } else {
                throw new BadRequestException("Invalid response from OpenAI API");
            }
        } catch (error) {
            console.error("Error during API call:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw new BadRequestException(
                    error.response.data?.error?.message || "Error communicating with the AI service"
                );
            }
            throw new InternalServerErrorException("Erreur interne du serveur lors de la communication avec le service IA");
        }
    }

    private async updateProcessAndSteps(process_id: number, roadmapJson: any): Promise<void> {
        const process = await this.processRepository.findOne({ where: { id: process_id } });

        if (!process) {
            throw new NotFoundException(`Process with ID ${process_id} not found`);
        }

        process.name = roadmapJson.name;
        process.description = roadmapJson.description;
        await this.processRepository.save(process);

        await this.stepRepository.delete({ process: { id: process_id } });

        console.log("Updating process and steps with new roadmap data:", roadmapJson);
        for (const step of roadmapJson.steps) {
            const newStep = this.stepRepository.create({
                name: step.name,
                description: step.description,
                process: process,
            });
            await this.stepRepository.save(newStep);
        }
    }
}