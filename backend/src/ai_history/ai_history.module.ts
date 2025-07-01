import { Module } from '@nestjs/common';
import { AiHistoryService } from './ai_history.service';
import { AiHistoryController } from './ai_history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHistory } from './entities/ai_history.entity';
import { User } from '../users/entities/user.entity';
import { Process } from '../process/entities/process.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiHistory, User, Process])],
  controllers: [AiHistoryController],
  providers: [AiHistoryService],
  exports: [AiHistoryService, TypeOrmModule],
})
export class AiHistoryModule {}

