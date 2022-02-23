import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import JwtRefreshTokenGuard from './guards/jwt-refresh-token.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';

@Controller('sessions')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(
    private authenticationService: AuthenticationService,
    private usersService: UsersService,
    private emailConfirmationService: EmailConfirmationService,
  ) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  me(@Req() request: Request) {
    return request.user;
  }

  @Post('register')
  async register(
    @Body() registrationData: RegisterDto,
    @Query('verification_mode') verification_mode: 'link' | 'code' = 'link',
  ) {
    const user = await this.authenticationService.register(registrationData);

    switch (verification_mode) {
      case 'link':
        await this.emailConfirmationService.sendVerificationLink(
          registrationData.email,
        );
        break;
      case 'code':
        await this.emailConfirmationService.sendVerificationCode(user.email);
        break;
    }

    return user;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('')
  async login(@Req() request: Request) {
    const user = request.user;
    const userAgent = request.get('User-Agent');

    if (user.is_2fa_enabled) {
      return {
        token: this.authenticationService.get2faTemporaryToken(user),
        next_action: '2FA_AUTH',
      };
    }

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
