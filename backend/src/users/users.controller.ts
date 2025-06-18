import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserDtoResponse } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiCreatedResponse({
    description: 'The user has been successfully created',
    type: CreateUserDto,
    isArray: false
  })
  @ApiBadRequestResponse({description: 'Bad Request'})
  @ApiConflictResponse({description: 'User already exists'})
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiOkResponse({
    description: 'The users has been successfully retrieved',
    type: CreateUserDto,
    isArray: true
  })
  @ApiBadRequestResponse({description: 'Bad Request'})
  findAll(): Promise<CreateUserDto[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiOkResponse({
    description: 'The user has been successfully retrieved',
    type: UserDtoResponse,
    isArray: false
  })
  @ApiBadRequestResponse({description: 'Bad Request'})
  @ApiNotFoundResponse({description: 'User Not Found'})
  async findMe(@Request() req: any): Promise<UserDtoResponse> {
    const user = await this.usersService.findMe(req['user'].sub);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActivated: user.isActive,
      processes: user.processes
    };
  }

  @Get(':email')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiOkResponse({
    description: 'The user has been successfully retrieved',
    type: CreateUserDto,
    isArray: false
  })
  @ApiBadRequestResponse({description: 'Bad Request'})
  @ApiNotFoundResponse({description: 'User Not Found'})
  findOne(@Param('email') email: string): Promise<CreateUserDto> {
    return this.usersService.findOne(email);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiOkResponse({
    description: 'The user has been successfully updated',
    type: CreateUserDto,
    isArray: false
  })
  @ApiNotFoundResponse({description: 'User Not Found'})
  @ApiBadRequestResponse({description: 'Bad Request'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiTags('Users')
  @ApiOkResponse({
    description: 'The user has been successfully deleted',
    type: CreateUserDto,
    isArray: false
  })
  @ApiNotFoundResponse({description: 'User Not Found'})
  remove(@Param('id') id: string){
    return this.usersService.remove(+id);
  }
}
