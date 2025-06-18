import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListAdministrativeProcess } from './entities/list_administrative_process.entity';
import { CreateListAdministrativeProcessDto } from './dto/create-list-administrative-process.dto';
import { UpdateListAdministrativeProcessDto } from './dto/update-list-administrative-process.dto';

@Injectable()
export class ListAdministrativeProcessService {
  constructor(
    @InjectRepository(ListAdministrativeProcess)
    private readonly repo: Repository<ListAdministrativeProcess>,
  ) {}

  async create(dto: CreateListAdministrativeProcessDto): Promise<ListAdministrativeProcess> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<ListAdministrativeProcess[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<ListAdministrativeProcess> {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Process with ID ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateListAdministrativeProcessDto): Promise<ListAdministrativeProcess> {
    const result = await this.repo.update(id, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Process with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Process with ID ${id} not found`);
    }
  }
}
