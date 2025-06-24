import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/Request/register-user-request.dto';
import { LoginUserDto } from './dto/Request/login-user-request.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a user', async () => {
      const dto: RegisterUserDto = { email: 'test@example.com', password: 'pass', firstName: 'John', lastName: 'Doe' } as any;
      const response = { message: 'User created successfully', id: 1 };
      mockAuthService.signUp.mockResolvedValue(response);

      const result = await controller.signUp(dto);
      expect(result).toEqual(response);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should throw if user already exists', async () => {
      mockAuthService.signUp.mockRejectedValue(new ConflictException());
      await expect(controller.signUp({} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('signIn', () => {
    it('should login a user', async () => {
      const dto: LoginUserDto = { email: 'test@example.com', password: 'pass' } as any;
      const response = { message: 'User logged in successfully', accessToken: 'token' };
      mockAuthService.signIn.mockResolvedValue(response);

      const result = await controller.signIn(dto);
      expect(result).toEqual(response);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(dto);
    });

    it('should throw if credentials are invalid', async () => {
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());
      await expect(controller.signIn({} as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});