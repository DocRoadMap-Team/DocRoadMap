import { Test, TestingModule } from '@nestjs/testing';
import { ProcessController } from './process.controller';
import { ProcessService } from './process.service';
import { NotFoundException } from '@nestjs/common';

const mockProcessService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProcessController', () => {
  let controller: ProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessController],
      providers: [
        { provide: ProcessService, useValue: mockProcessService },
      ],
    }).compile();

    controller = module.get<ProcessController>(ProcessController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a process', async () => {
      const dto = { name: 'p', description: 'd', userId: 1, stepsId: [1, 2] };
      const process = { id: 1, ...dto };
      mockProcessService.create.mockResolvedValue(process);

      const result = await controller.create(dto as any);
      expect(result).toEqual(process);
      expect(mockProcessService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all processes', async () => {
      const processes = [{ id: 1 }, { id: 2 }];
      mockProcessService.findAll.mockResolvedValue(processes);

      const result = await controller.findAll();
      expect(result).toEqual(processes);
      expect(mockProcessService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a process by id', async () => {
      const process = { id: 1 };
      mockProcessService.findOne.mockResolvedValue(process);

      const result = await controller.findOne('1');
      expect(result).toEqual(process);
      expect(mockProcessService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if process not found', async () => {
      mockProcessService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a process', async () => {
      const updateDto = { name: 'updated' };
      const updated = { affected: 1 };
      mockProcessService.update.mockResolvedValue(updated);

      const result = await controller.update('1', updateDto as any);
      expect(result).toEqual(updated);
      expect(mockProcessService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a process', async () => {
      const removed = { affected: 1 };
      mockProcessService.remove.mockResolvedValue(removed);

      const result = await controller.remove('1');
      expect(result).toEqual(removed);
      expect(mockProcessService.remove).toHaveBeenCalledWith(1);
    });
  });
});