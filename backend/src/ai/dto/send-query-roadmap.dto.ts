import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsNotEmpty } from "class-validator";

export class QueryRoadmapDto {
    @ApiProperty({ example: "I want to add a step for user onboarding." })
    @IsString()
    @IsNotEmpty()
    public prompt: string;

    @ApiProperty({ example: 1, description: "ID of the process to modify" })
    @IsInt()
    @IsNotEmpty()
    public process_id: number;
}