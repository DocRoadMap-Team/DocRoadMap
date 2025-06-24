import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMe: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'test@example.com', password: 'pass' };
      const user = { id: 1, ...dto };
      mockUsersService.create.mockResolvedValue(user);

      const result = await controller.create(dto as any);
      expect(result).toEqual(user);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw if user already exists', async () => {
      mockUsersService.create.mockRejectedValue(new ConflictException());
      await expect(controller.create({} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findMe', () => {
    it('should return the current user', async () => {
      const req = { user: { sub: 1 } };
      const user = { id: 1, firstName: 'a', lastName: 'b', email: 'e', isActive: true, processes: [] };
      mockUsersService.findMe.mockResolvedValue(user);

      const result = await controller.findMe(req as any);
      expect(result).toEqual({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActivated: user.isActive,
        processes: user.processes,
      });
      expect(mockUsersService.findMe).toHaveBeenCalledWith(1);
    });

    it('should throw if user not found', async () => {
      mockUsersService.findMe.mockRejectedValue(new NotFoundException());
      await expect(controller.findMe({ user: { sub: 1 } } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('test@example.com');
      expect(result).toEqual(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'new' };
      const updated = { affected: 1 };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('1', updateDto as any);
      expect(result).toEqual(updated);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const removed = { affected: 1 };
      mockUsersService.remove.mockResolvedValue(removed);

      const result = await controller.remove('1');
      expect(result).toEqual(removed);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw if user not found', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});