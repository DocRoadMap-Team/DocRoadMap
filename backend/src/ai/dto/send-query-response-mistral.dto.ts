import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendQueryResponseMistralDTO {
    @ApiProperty({
        description: 'If true the roadmap will be generated',
        type: 'boolean'
    })
    @IsBoolean()
    public is_roadmap: boolean;

    @ApiProperty({
        description: 'The collection name to get infromation from the vectorial database',
        type: 'string'
    })
    @IsString()
    public collection_name: string;

    @ApiProperty({
        description: 'The response from the model AI',
        type: 'string'
    })
    @IsString()
    public response: string;
}
