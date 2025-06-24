import { Test, TestingModule } from '@nestjs/testing';
import { ListAdministrativeProcessService } from './list_administrative_process.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListAdministrativeProcess } from './entities/list_administrative_process.entity';
import { NotFoundException } from '@nestjs/common';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ListAdministrativeProcessService', () => {
  let service: ListAdministrativeProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAdministrativeProcessService,
        { provide: getRepositoryToken(ListAdministrativeProcess), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ListAdministrativeProcessService>(ListAdministrativeProcessService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a process', async () => {
      const dto = { name: 'Process 1', collection_name: 'process_1' };
      const entity = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(entity);
      mockRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);
      expect(result).toEqual(entity);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should return all processes', async () => {
      const entities = [{ id: 1 }, { id: 2 }];
      mockRepository.find.mockResolvedValue(entities);

      const result = await service.findAll();
      expect(result).toEqual(entities);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a process by ID', async () => {
      const entity = { id: 1, name: 'Process 1', collection_name: 'process_1' };
      mockRepository.findOneBy.mockResolvedValue(entity);

      const result = await service.findOne(1);
      expect(result).toEqual(entity);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if process not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated process', async () => {
      const dto = { name: 'Updated Process' };
      const entity = { id: 1, ...dto };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(entity);

      const result = await service.update(1, dto);
      expect(result).toEqual(entity);
      expect(mockRepository.update).toHaveBeenCalledWith(1, dto);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if process not found during update', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      await expect(service.update(1, { name: 'Updated Process' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a process', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if process not found during removal', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});