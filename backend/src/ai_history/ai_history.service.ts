import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiHistory } from './entities/ai_history.entity';
import { CreateAiHistoryDto } from './dto/create-ai_history.dto';
import { UpdateAiHistoryDto } from './dto/update-ai_history.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiHistoryService {
  constructor(
    @InjectRepository(AiHistory)
    private readonly aiHistoryRepo: Repository<AiHistory>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async create(createAiHistoryDto: CreateAiHistoryDto): Promise<AiHistory> {
    const user = await this.userRepo.findOneBy({ id: createAiHistoryDto.userId });
    if (!user) throw new NotFoundException(`User with ID ${createAiHistoryDto.userId} not found`);

    const aiHistory = this.aiHistoryRepo.create({
      history: createAiHistoryDto.history,
      user,
    });

    return this.aiHistoryRepo.save(aiHistory);
  }

  async findAll(): Promise<AiHistory[]> {
    return this.aiHistoryRepo.find({ relations: ['user'] });
  }

  async findOne(user_id: number): Promise<AiHistory> {
    const history = await this.aiHistoryRepo.findOne({
      where: { user: { id: user_id } },
      relations: ['user'],
    });
    if (!history) throw new NotFoundException(`AiHistory with the user ID ${user_id} not found`);
    return history;
  }

  async update(id: number, updateDto: UpdateAiHistoryDto): Promise<AiHistory> {
    const history = await this.findOne(id);

    if (updateDto.history) {
      history.history = updateDto.history;
    }

    if (updateDto.userId) {
      const user = await this.userRepo.findOneBy({ id: updateDto.userId });
      if (!user) throw new NotFoundException(`User with ID ${updateDto.userId} not found`);
      history.user = user;
    }

    return this.aiHistoryRepo.save(history);
  }

  async remove(id: number): Promise<void> {
    const findAiHistory = await this.aiHistoryRepo.findOne({ where: { id: id } });
    if (!findAiHistory) {
      throw new NotFoundException('AiHistory Not Found');
    }
    await this.aiHistoryRepo.delete(id);
  }

  async appendToHistory(createAiHistoryDto: CreateAiHistoryDto): Promise<AiHistory> {
    const user = await this.userRepo.findOneBy({ id: createAiHistoryDto.userId });
    if (!user) throw new NotFoundException(`User with ID ${createAiHistoryDto.userId} not found`);

    let history = await this.aiHistoryRepo.findOne({
      where: { user: { id: createAiHistoryDto.userId } },
      relations: ['user'],
    });

    if (!history) {
      history = this.aiHistoryRepo.create({
        history: createAiHistoryDto.history,
        user,
      });
    } else {
      history.history += `\n${createAiHistoryDto.history}`;
    }

    return this.aiHistoryRepo.save(history);
  }
}
