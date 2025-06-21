import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Process } from './entities/process.entity';
import { Not, Repository } from 'typeorm';
import { Step } from '../steps/entities/step.entity';
import { User } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Process)
    private processRepository: Repository<Process>,
  ) { }

  async create(createProcessDto: CreateProcessDto) {
    const { stepsId, userId, ...processData } = createProcessDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    let steps = [];
    if (stepsId && Array.isArray(stepsId)) {
      steps = await this.stepRepository.findByIds(stepsId);
      if (steps.length !== stepsId.length) {
        throw new NotFoundException(`Some steps not found`);
      }
    }

    const createProcess = this.processRepository.create({
      ...processData,
      user,
      steps,
      uuid: uuidv4(),
    });
    return await this.processRepository.save(createProcess);
  }

  async findAll() {
    return await this.processRepository.find({relations: ['user', 'steps']});
  }

  async findOne(id: number) {
    const findProcess = await this.processRepository.findOne({
      where: { id: id },
      relations: ['user', 'steps']
    });
  
    if (!findProcess) {
      throw new NotFoundException(`Process #${id} not found`);
    }
  
    return findProcess;
  }

  async update(id: number, updateProcessDto: UpdateProcessDto) {
    const findProcess = await this.processRepository.findOne({ where: { id: id } });
    if (!findProcess) {
      throw new NotFoundException(`Process #${id} not found`);
    }
    return await this.processRepository.update(id, updateProcessDto);
  }

  async remove(id: number) {
    const findProcess = await this.processRepository.findOne({ where: { id: id } });
    if (!findProcess) {
      throw new NotFoundException(`Process #${id} not found`);
    }
    return await this.processRepository.delete(id);
  }
}
