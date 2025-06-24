import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiHistory } from '../ai_history/entities/ai_history.entity';
import { User } from '../users/entities/user.entity';
import { AiHistoryModule } from '../ai_history/ai_history.module';
import { Step } from '../steps/entities/step.entity';
import { Process } from '../process/entities/process.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([AiHistory, User, Process, Step]), AiHistoryModule],
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: 'AI_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('AI_URL') ?? 'http://localhost:8083',
      inject: [ConfigService],
    },
  ],
  exports: [AiService, TypeOrmModule],
})
export class AiModule {}
