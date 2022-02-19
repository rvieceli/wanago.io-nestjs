import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigurationService,
  ) {}

  async generateSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );

    await this.usersService.set2faSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
    };
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  isTokenValid(token: string, user: User) {
    return authenticator.verify({
      token,
      secret: user.two_factors_authentication_secret,
    });
  }
}
