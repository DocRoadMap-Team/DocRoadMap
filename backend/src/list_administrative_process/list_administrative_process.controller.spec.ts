import { Test, TestingModule } from '@nestjs/testing';
import { ListAdministrativeProcessController } from './list_administrative_process.controller';
import { ListAdministrativeProcessService } from './list_administrative_process.service';
import { NotFoundException } from '@nestjs/common';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ListAdministrativeProcessController', () => {
  let controller: ListAdministrativeProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListAdministrativeProcessController],
      providers: [
        { provide: ListAdministrativeProcessService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ListAdministrativeProcessController>(ListAdministrativeProcessController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a process', async () => {
      const dto = { name: 'Proc 1', collection_name: 'proc_1' };
      const entity = { id: 1, ...dto };
      mockService.create.mockResolvedValue(entity);

      const result = await controller.create(dto as any);
      expect(result).toEqual(entity);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all processes', async () => {
      const entities = [{ id: 1 }, { id: 2 }];
      mockService.findAll.mockResolvedValue(entities);

      const result = await controller.findAll();
      expect(result).toEqual(entities);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a process by id', async () => {
      const entity = { id: 1 };
      mockService.findOne.mockResolvedValue(entity);

      const result = await controller.findOne('1');
      expect(result).toEqual(entity);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a process', async () => {
      const updateDto = { name: 'new' };
      const updated = { affected: 1 };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update('1', updateDto as any);
      expect(result).toEqual(updated);
      expect(mockService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a process', async () => {
      const removed = { affected: 1 };
      mockService.remove.mockResolvedValue(removed);

      const result = await controller.remove('1');
      expect(result).toEqual(removed);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      mockService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});