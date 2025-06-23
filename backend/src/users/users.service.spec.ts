import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const dto = { email: 'test@example.com', password: 'pass', firstName: 'John', lastName: 'Doe' };
      const user = { id: 1, ...dto };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.create(dto as any);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...dto, password: 'hashedPassword' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ email: 'test@example.com' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findMe', () => {
    it('should return the current user', async () => {
      const user = { id: 1, email: 'test@example.com', processes: [] };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findMe(1);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['processes', 'processes.steps'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findMe(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['processes', 'processes.steps'] });
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('test@example.com');
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['processes', 'processes.steps'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('test@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'new' };
      const updated = { affected: 1 };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, updateDto as any);
      expect(result).toEqual(updated);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const removed = { affected: 1 };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.delete.mockResolvedValue(removed);

      const result = await service.remove(1);
      expect(result).toEqual(removed);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});