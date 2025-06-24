import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Status } from '../enum/status.enum';

@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiCreatedResponse({ 
    description: 'The Step has been successfully created.',
    type: CreateStepDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  create(@Body() createStepDto: CreateStepDto) {
    return this.stepsService.create(createStepDto);
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiOkResponse({
    description: 'The Steps has been successfully retrieved.',
    type: CreateStepDto,
    isArray: true
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findAll() {
    return this.stepsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiOkResponse({
    description: 'The Step has been successfully retrieved.',
    type: CreateStepDto,
    isArray: false
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Step Not Found' })
  findOne(@Param('id') id: string) {
    return this.stepsService.findOne(+id);
  }

  @Patch('end-status/:id')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiOkResponse({
    description: 'The Step has been successfully updated.',
    isArray: false
  })
  @ApiNotFoundResponse({ description: 'Step Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  endStep(@Param('id') id: string) {
    return this.stepsService.update(+id, { status: Status.COMPLETED, endedAt: new Date() });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiOkResponse({
    description: 'The Step has been successfully updated.',
    type: UpdateStepDto,
    isArray: false
  })
  @ApiNotFoundResponse({ description: 'Step Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    return this.stepsService.update(+id, updateStepDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiTags('Steps')
  @ApiOkResponse({
    description: 'The Step has been successfully deleted.',
    type: CreateStepDto,
    isArray: false
  })
  @ApiNotFoundResponse({ description: 'Step Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.stepsService.remove(+id);
  }
}
