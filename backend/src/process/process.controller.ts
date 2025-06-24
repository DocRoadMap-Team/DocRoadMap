import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Status } from '../enum/status.enum';

@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiCreatedResponse({ 
    description: 'The Process has been successfully created.',
    type: CreateProcessDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  create(@Body() createProcessDto: CreateProcessDto) {
    return this.processService.create(createProcessDto);
  }

  @Post('end-process/:id')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiOkResponse({
    description: 'The Process has been successfully ended.',
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Process Not Found' })
  endProcess(@Param('id') id: string) {
    return this.processService.update(+id, { status: Status.COMPLETED, endedAt: new Date() });
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiOkResponse({
    description: 'The Processes has been successfully retrieved.',
    type: CreateProcessDto,
    isArray: true
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findAll() {
    return this.processService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiOkResponse({
    description: 'The Process has been successfully retrieved.',
    type: CreateProcessDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Process Not Found' })
  findOne(@Param('id') id: string) {
    return this.processService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiOkResponse({
    description: 'The Process has been successfully updated.',
    type: CreateProcessDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Process Not Found' })
  update(@Param('id') id: string, @Body() updateProcessDto: UpdateProcessDto) {
    return this.processService.update(+id, updateProcessDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiTags('Process')
  @ApiOkResponse({
    description: 'The Process has been successfully deleted.',
    type: CreateProcessDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Process Not Found' })
  remove(@Param('id') id: string) {
    return this.processService.remove(+id);
  }
}
