import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendQueryDto {
    @ApiProperty({
        description: 'The prompt or question to send to the AI model',
        example: 'What is the capital of France?',
        required: true,
        type: 'string',
    })
    @IsString()
    @IsNotEmpty()
    public prompt: string;

    @ApiProperty({
        description: 'The AI model to use for the query',
        example: 'gpt-4',
        required: true,
        type: 'string',
    })
    @IsString()
    @IsNotEmpty()
    public model: string;
}