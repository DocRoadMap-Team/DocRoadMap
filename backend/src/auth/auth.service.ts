// auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/Request/register-user-request.dto';
import { RegisterUserDtoResponse } from './dto/Response/register-user-response.dto';
import { LoginUserDtoResponse } from './dto/Response/login-user-response.dto';
import { LoginUserDto } from './dto/Request/login-user-request.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Process } from '../process/entities/process.entity';
import { join } from 'path';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async signIn(signInDto: LoginUserDto): Promise<LoginUserDtoResponse> {
    const user = await this.usersService.findOne(signInDto.email);
    if (!user || !(await bcrypt.compare(signInDto.password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    await this.usersService.update(user.id, { latestLogin: new Date() });
    const payload = { sub: user.id, email: user.email };

    return {
      message: 'User logged in successfully',
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActivated: user.isActive,
      processIds: user.processes?.map((p: Process) => p.id) || [],
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: RegisterUserDto): Promise<RegisterUserDtoResponse> {
    const existUser = await this.usersService.findOne(signUpDto.email).catch(() => null);
    if (existUser) throw new ConflictException('User already exists');

    const user = await this.usersService.create(signUpDto);
    const token = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '1d' }
    );

    const confirmUrl = `${this.configService.get('FRONTEND_URL')}/auth/confirm-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Email Confirmation',
        template: './confirm-email',
        context: {
          name: user.firstName,
          confirmUrl,
        },
        attachments: [
          {
            filename: 'docroadmap.png',
            path: join(__dirname, '..', '..', 'assets', 'docroadmap.png'),
            cid: 'docroadmap',
          },
        ],
      });
      console.log(`Confirmation email sent to ${user.email}`);
    } catch (e) {
        console.error('Erreur envoi mail:', e);
        throw new InternalServerErrorException('Failed to send confirmation email');
    }

    return {
      message: 'User created successfully, please confirm your email',
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActivated: user.isActive,
      processIds: user.processes?.map((p: Process) => p.id) || [],
    };
  }

  async confirmEmail(token: string): Promise<string> {
    try {
      const { sub } = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findMe(sub);
      if (!user) throw new NotFoundException('User not found');
      if (user.isActive) return 'Email already confirmed';

      await this.usersService.update(user.id, { isActive: true });
      return 'Email successfully confirmed';
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
