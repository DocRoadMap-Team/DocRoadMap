import { forwardRef, Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from './entities/process.entity';
import { UsersModule } from '../users/users.module';
import { StepsModule } from '../steps/steps.module';

@Module({
  imports: [TypeOrmModule.forFeature([Process]), forwardRef(() => ProcessModule), forwardRef(() => UsersModule), forwardRef(() => StepsModule)],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService, TypeOrmModule]
})
export class ProcessModule {}
