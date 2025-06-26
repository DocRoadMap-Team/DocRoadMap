import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiProperty({
        description: 'The firstname of the user',
        type: 'string',
        required: false
    })
    @IsString()
    @IsOptional()
    public firstName?: string;
    
    @ApiProperty({
        description: 'The lastname of the user',
        type: 'string',
        required: false
    })
    @IsString()
    @IsOptional()
    public lastName?: string;
    
    @ApiProperty({
        description: 'The email of the user',
        type: 'string',
        required: false
    })
    @IsEmail()
    @IsOptional()
    public email?: string;
    
    @ApiProperty({
        description: 'The password of the user',
        type: 'string',
        required: false
    })
    @IsString()
    @IsOptional()
    public password?: string;

    @ApiProperty({
        description: 'The processes of the user',
        type: '[number]',
        required: false
    })
    @IsOptional()
    public processIds?: number[];

    @ApiProperty({
        description: 'The latest login of the user',
        type: 'Date',
        required: false
    })
    @IsOptional()
    public latestLogin?: Date;

    @ApiProperty({
        description: 'The activation status of the user',
        type: 'boolean',
        required: false
    })
    @IsOptional()
    public isActive?: boolean;
}
