import { Test, TestingModule } from '@nestjs/testing';
import { StepsController } from './steps.controller';
import { StepsService } from './steps.service';
import { NotFoundException } from '@nestjs/common';

const mockStepsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StepsController', () => {
  let controller: StepsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StepsController],
      providers: [
        { provide: StepsService, useValue: mockStepsService },
      ],
    }).compile();

    controller = module.get<StepsController>(StepsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a step', async () => {
      const dto = { name: 'step', description: 'desc', processId: 1 };
      const step = { id: 1, ...dto };
      mockStepsService.create.mockResolvedValue(step);

      const result = await controller.create(dto as any);
      expect(result).toEqual(step);
      expect(mockStepsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all steps', async () => {
      const steps = [{ id: 1 }, { id: 2 }];
      mockStepsService.findAll.mockResolvedValue(steps);

      const result = await controller.findAll();
      expect(result).toEqual(steps);
      expect(mockStepsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a step by id', async () => {
      const step = { id: 1 };
      mockStepsService.findOne.mockResolvedValue(step);

      const result = await controller.findOne('1');
      expect(result).toEqual(step);
      expect(mockStepsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if step not found', async () => {
      mockStepsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a step', async () => {
      const updateDto = { name: 'updated' };
      const updated = { affected: 1 };
      mockStepsService.update.mockResolvedValue(updated);

      const result = await controller.update('1', updateDto as any);
      expect(result).toEqual(updated);
      expect(mockStepsService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a step', async () => {
      const removed = { affected: 1 };
      mockStepsService.remove.mockResolvedValue(removed);

      const result = await controller.remove('1');
      expect(result).toEqual(removed);
      expect(mockStepsService.remove).toHaveBeenCalledWith(1);
    });
  });
});