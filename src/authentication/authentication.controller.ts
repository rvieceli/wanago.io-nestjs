import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import JwtRefreshTokenGuard from './guards/jwt-refresh-token.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';

@Controller('sessions')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  me(@Req() request: Request) {
    return request.user;
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('')
  async login(@Req() request: Request) {
    const user = request.user;
    const userAgent = request.get('User-Agent');

    return this.authenticationService.getTokens(user, userAgent);
  }

  @HttpCode(200)
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  refresh(@Req() request: Request) {
    const user = request.user;
    const userAgent = request.get('User-Agent');

    return this.authenticationService.getTokens(user, userAgent);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  async logout(@Req() request: Request) {
    await this.authenticationService.logOut(request._verifier);
  }
}
