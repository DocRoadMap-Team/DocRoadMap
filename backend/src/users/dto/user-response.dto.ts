import { ApiProperty } from '@nestjs/swagger';
import { CreateProcessDto } from '../../process/dto/create-process.dto';
import { Process } from '../../process/entities/process.entity';

export class UserDtoResponse {
    @ApiProperty({
        description: 'The id of the user',
        type: 'number'
    })
    public id: number;

    @ApiProperty({
        description: 'The firstname of the user',
        type: 'string'
    })
    public firstName?: string;
    
    @ApiProperty({
        description: 'The lastname of the user',
        type: 'string'
    })
    public lastName?: string;
    
    @ApiProperty({
        description: 'The email of the user',
        type: 'string'
    })
    public email?: string;

    @ApiProperty({
        description: 'The status of the account',
        type: 'boolean'
    })
    public isActivated?: boolean;

    @ApiProperty({
        description: 'The processes of the user',
        type: CreateProcessDto,
        isArray: true
    })
    public processes?: Process[];
}
