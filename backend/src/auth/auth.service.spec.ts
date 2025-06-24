import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/Request/register-user-request.dto';
import { LoginUserDto } from './dto/Request/login-user-request.dto';

jest.mock('bcrypt');

const mockUsersService = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue(true),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      JWT_SECRET: 'test_secret',
      JWT_EXPIRES_IN: '1h',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findOne.mockResolvedValueOnce({ id: 1 });
      await expect(service.signUp({ email: 'test@example.com' } as RegisterUserDto)).rejects.toThrow(ConflictException);
    });

    it('should create and return a new user', async () => {
      mockUsersService.findOne.mockRejectedValueOnce(new NotFoundException());
      mockUsersService.create.mockResolvedValueOnce({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        isActive: true,
        processes: [{ id: 1 }],
      });
      const dto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'pass' };
      const result = await service.signUp(dto as RegisterUserDto);
      expect(result).toEqual({
        message: 'User created successfully, please confirm your email',
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        isActivated: true,
        processIds: [1],
      });
    });
  });

  describe('signIn', () => {
    it('should throw NotFound if user not found', async () => {
      mockUsersService.findOne.mockRejectedValueOnce(new NotFoundException());
      await expect(service.signIn({ email: 'test@example.com', password: 'pass' } as LoginUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findOne.mockResolvedValueOnce({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.signIn({ email: 'test@example.com', password: 'wrong' } as LoginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return login response if credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        processes: [{ id: 1 }],
      };
      mockUsersService.findOne.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUsersService.update.mockResolvedValueOnce(null);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');

      const dto = { email: 'test@example.com', password: 'pass' };
      const result = await service.signIn(dto as LoginUserDto);

      expect(result).toEqual({
        message: 'User logged in successfully',
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        isActivated: true,
        processIds: [1],
        accessToken: 'accessToken',
      });
    });
  });
});