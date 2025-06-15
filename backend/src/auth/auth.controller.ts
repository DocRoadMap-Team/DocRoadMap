
import { Body, Controller, Post, UseGuards, Get, Request, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiUnauthorizedResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/Request/register-user-request.dto';
import { RegisterUserDtoResponse } from './dto/Response/register-user-response.dto';
import { LoginUserDto } from './dto/Request/login-user-request.dto';
import { Public } from '../decorators/public.decorators';
import { LoginUserDtoResponse } from './dto/Response/login-user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiTags('Authentication')
  @ApiOkResponse({
    description: 'The user has been successfully logged in',
    isArray: false,
    type: LoginUserDtoResponse,
  })
  @ApiUnauthorizedResponse({description: 'Invalid Credentials'})
  async signIn(@Body() signInDto: LoginUserDto): Promise<LoginUserDtoResponse> {
    return await this.authService.signIn(signInDto);
  }

  @Post('register')
  @Public()
  @ApiTags('Authentication')
  @ApiCreatedResponse({
    description: 'The user has been successfully registered',
    isArray: false,
    type: RegisterUserDtoResponse,
  })
  async signUp(@Body() signUpDto: RegisterUserDto): Promise<RegisterUserDtoResponse> {
    return await this.authService.signUp(signUpDto);
  }

  @Get('confirm-email')
  @Public()
  @ApiTags('Authentication')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const message = await this.authService.confirmEmail(token);
      return res.render('status-confirm-email', { message });
    } catch (error) {
      return res.render('status-confirm-email', { message: 'Lien invalide ou expiré.' });
    }
  }
}
