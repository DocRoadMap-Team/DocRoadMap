import { Test, TestingModule } from '@nestjs/testing';
import { StepsService } from './steps.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Step } from './entities/step.entity';
import { Process } from '../process/entities/process.entity';
import { NotFoundException } from '@nestjs/common';

const mockStepRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockProcessRepository = {
  findOne: jest.fn(),
};

describe('StepsService', () => {
  let service: StepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepsService,
        { provide: getRepositoryToken(Step), useValue: mockStepRepository },
        { provide: getRepositoryToken(Process), useValue: mockProcessRepository },
      ],
    }).compile();

    service = module.get<StepsService>(StepsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a step', async () => {
      const dto = { name: 'step', description: 'desc', processId: 1 };
      const process = { id: 1 };
      const step = { ...dto, process };

      mockProcessRepository.findOne.mockResolvedValue(process);
      mockStepRepository.create.mockReturnValue(step);
      mockStepRepository.save.mockResolvedValue(step);

      const result = await service.create(dto as any);
      expect(result).toEqual(step);
      expect(mockProcessRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockStepRepository.create).toHaveBeenCalledWith({ name: 'step', description: 'desc', process });
      expect(mockStepRepository.save).toHaveBeenCalledWith(step);
    });

    it('should throw if process not found', async () => {
      mockProcessRepository.findOne.mockResolvedValue(undefined);
      await expect(service.create({ processId: 1 } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all steps', async () => {
      const steps = [{ id: 1 }];
      mockStepRepository.find.mockResolvedValue(steps);
      const result = await service.findAll();
      expect(result).toEqual(steps);
      expect(mockStepRepository.find).toHaveBeenCalledWith({ relations: ['process'] });
    });
  });

  describe('findOne', () => {
    it('should return a step', async () => {
      const step = { id: 1 };
      mockStepRepository.findOne.mockResolvedValue(step);
      const result = await service.findOne(1);
      expect(result).toEqual(step);
      expect(mockStepRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['process'],
      });
    });

    it('should throw if step not found', async () => {
      mockStepRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a step', async () => {
      mockStepRepository.findOne.mockResolvedValue({ id: 1 });
      mockStepRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(1, { name: 'new' } as any);
      expect(result).toEqual({ affected: 1 });
      expect(mockStepRepository.update).toHaveBeenCalledWith(1, { name: 'new' });
    });

    it('should throw if step not found', async () => {
      mockStepRepository.findOne.mockResolvedValue(undefined);
      await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a step', async () => {
      mockStepRepository.findOne.mockResolvedValue({ id: 1 });
      mockStepRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1);
      expect(result).toEqual({ affected: 1 });
      expect(mockStepRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if step not found', async () => {
      mockStepRepository.findOne.mockResolvedValue(undefined);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
