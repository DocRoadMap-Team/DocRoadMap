import { Test, TestingModule } from '@nestjs/testing';
import { ProcessService } from './process.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Process } from './entities/process.entity';
import { Step } from '../steps/entities/step.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockProcessRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockStepRepository = {
  findByIds: jest.fn(),
};
const mockUserRepository = {
  findOne: jest.fn(),
};

describe('ProcessService', () => {
  let service: ProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessService,
        { provide: getRepositoryToken(Process), useValue: mockProcessRepository },
        { provide: getRepositoryToken(Step), useValue: mockStepRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<ProcessService>(ProcessService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a process', async () => {
      const dto = { name: 'p', description: 'd', userId: 1, stepsId: [1, 2] };
      const user = { id: 1 };
      const steps = [{ id: 1 }, { id: 2 }];
      const process = { ...dto, user, steps };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockStepRepository.findByIds.mockResolvedValue(steps);
      mockProcessRepository.create.mockReturnValue(process);
      mockProcessRepository.save.mockResolvedValue(process);

      const result = await service.create(dto as any);
      expect(result).toEqual(process);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockStepRepository.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockProcessRepository.create).toHaveBeenCalledWith({ name: 'p', description: 'd', user, steps });
      expect(mockProcessRepository.save).toHaveBeenCalledWith(process);
    });

    it('should throw if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);
      await expect(service.create({ userId: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if some steps not found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockStepRepository.findByIds.mockResolvedValue([{ id: 1 }]);
      await expect(service.create({ userId: 1, stepsId: [1, 2] } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all processes', async () => {
      const processes = [{ id: 1 }];
      mockProcessRepository.find.mockResolvedValue(processes);
      const result = await service.findAll();
      expect(result).toEqual(processes);
      expect(mockProcessRepository.find).toHaveBeenCalledWith({ relations: ['user', 'steps'] });
    });
  });

  describe('findOne', () => {
    it('should return a process', async () => {
      const process = { id: 1 };
      mockProcessRepository.findOne.mockResolvedValue(process);
      const result = await service.findOne(1);
      expect(result).toEqual(process);
      expect(mockProcessRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'steps'],
      });
    });

    it('should throw if process not found', async () => {
      mockProcessRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a process', async () => {
      mockProcessRepository.findOne.mockResolvedValue({ id: 1 });
      mockProcessRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(1, { name: 'new' } as any);
      expect(result).toEqual({ affected: 1 });
      expect(mockProcessRepository.update).toHaveBeenCalledWith(1, { name: 'new' });
    });

    it('should throw if process not found', async () => {
      mockProcessRepository.findOne.mockResolvedValue(undefined);
      await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a process', async () => {
      mockProcessRepository.findOne.mockResolvedValue({ id: 1 });
      mockProcessRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1);
      expect(result).toEqual({ affected: 1 });
      expect(mockProcessRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if process not found', async () => {
      mockProcessRepository.findOne.mockResolvedValue(undefined);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
