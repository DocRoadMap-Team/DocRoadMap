import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendQueryGenerateRoadmapDTO {
    @ApiProperty({
        description: 'The query to send to the model AI',
        type: 'string',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    public query: string;

    @ApiProperty({
        description: 'The collection name to get infromation from the vectorial database',
        type: 'string',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    public collection_name: string;
}
