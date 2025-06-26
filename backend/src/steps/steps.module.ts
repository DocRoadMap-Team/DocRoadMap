import { forwardRef, Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities/step.entity';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [TypeOrmModule.forFeature([Step]), forwardRef(() => ProcessModule)],
  controllers: [StepsController],
  providers: [StepsService],
  exports: [StepsService, TypeOrmModule]
})
export class StepsModule {}
