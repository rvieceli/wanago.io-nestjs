import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthenticationDto } from './dto/two-factor-authentication.dto';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private usersService: UsersService,
    private authenticationService: AuthenticationService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  @Header('Content-Type', 'image/png')
  async generate(@Res() response: Response, @Req() request: Request) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateSecret(request.user);

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async turnOn2fa(
    @Req() request: Request,
    @Body() data: TwoFactorAuthenticationDto,
  ) {
    const { user } = request;

    const isTokenValid = this.twoFactorAuthenticationService.isTokenValid(
      data.token,
      user,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Wrong authentication token');
    }

    await this.usersService.enable2fa(user.id);
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: Request,
    @Body() data: TwoFactorAuthenticationDto,
  ) {
    const { user } = request;

    const isTokenValid = this.twoFactorAuthenticationService.isTokenValid(
      data.token,
      user,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Wrong authentication token');
    }

    return this.authenticationService.getTokens(
      user,
      request.get('User-Agent'),
    );
  }
}
