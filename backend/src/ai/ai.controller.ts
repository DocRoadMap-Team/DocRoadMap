import { Controller, Post, Body, Request } from "@nestjs/common";
import { AiService } from "./ai.service";
import { SendQueryGenerateRoadmapDTO } from "./dto/send-query-mistral.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { SendQueryResponseMistralDTO } from "./dto/send-query-response-mistral.dto";
import { StartConversationDTO } from "./dto/start-conversation.dto";
import { SendQueryDto } from "./dto/send-query.dto";
import { QueryRoadmapDto } from "./dto/send-query-roadmap.dto";
import { QueryImgDto } from "./dto/send-query-img.dto";

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('mistral-query')
    @ApiBearerAuth()
    @ApiTags('AI')
    @ApiOkResponse()
    queryAi(@Request() req: any, @Body() SendQueryDTO: SendQueryGenerateRoadmapDTO): Promise<SendQueryResponseMistralDTO> {
        return this.aiService.sendQuery(SendQueryDTO.query, SendQueryDTO.collection_name, req['user'].sub);
    }

    @Post('start-conversation')
    @ApiBearerAuth()
    @ApiTags('AI')
    @ApiOkResponse()
    startConversation(@Request() req: any, @Body() StartConversationDTO: StartConversationDTO): Promise<SendQueryResponseMistralDTO> {
        return this.aiService.startConversation(req['user'].sub, StartConversationDTO.collection_name);
    }

    @Post('query')
    @ApiBearerAuth()
    @ApiTags('AI')
    @ApiOkResponse()
    @ApiBadRequestResponse(
        { description: 'Bad Request - Invalid input data' }
    )
    @ApiInternalServerErrorResponse(
        { description: 'Internal Server Error - An unexpected error occurred' }
    )
    async queryChatGPT(@Request() req: any, @Body() SendQueryDto: SendQueryDto): Promise<{ response: string }> {
        const userId = req.user.sub;
        const response = await this.aiService.query(SendQueryDto.prompt, SendQueryDto.model, userId);
        return { response };
    }

    @Post('roadmap-query')
    @ApiBearerAuth()
    @ApiTags('AI')
    @ApiOkResponse({ description: 'Chatbot roadmap' })

    async roadmapQuery(@Request() req: any, @Body() QueryRoadmapDto: QueryRoadmapDto): Promise<any> {
        const userId = req.user.sub;
        return this.aiService.queryRoadmap(QueryRoadmapDto.prompt, userId, QueryRoadmapDto.process_id);
    }

    @Post('query-img')
    @ApiBearerAuth()
    @ApiTags('AI')
    @ApiOkResponse({
        description: 'Returns a description suitable for an HTML alt attribute.',
        schema: {
            type: 'object',
            properties: {
                alt: { type: 'string', description: 'The generated alt description for the image.' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Bad Request - Invalid or missing image URL.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing Bearer token.' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error - An unexpected error occurred.' })
    async queryImg(@Body() QueryImgDto: QueryImgDto): Promise<{ alt: string }> {
        return this.aiService.describeImage(QueryImgDto.url);
    }
}