import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload.interface';
import * as jwt from 'jsonwebtoken';
import { RefreshTokensService } from 'src/users/refresh-tokens.service';
import { BadTokenException } from '../exceptions/bad-token.exception';
import { ConfigurationService } from 'src/configuration/configuration.service';

export const JWT_REFRESH_TOKEN_STRATEGY_NAME = 'jwt-refresh-token';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_TOKEN_STRATEGY_NAME,
) {
  constructor(
    private configService: ConfigurationService,
    private refreshTokensService: RefreshTokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  getUserIdAndVerifierFromExpiredToken(request: Request) {
    try {
      const expiredToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

      const payload = jwt.verify(
        expiredToken,
        this.configService.get('JWT_SECRET'),
        { ignoreExpiration: true },
      ) as jwt.JwtPayload;

      return {
        userId: Number(payload.sub),
        verifier: payload.verifier,
      };
    } catch (e) {
      throw new BadRequestException('Bearer token is missing');
    }
  }

  async validate(request: Request, payload: JwtRefreshPayload) {
    const { userId, verifier } =
      this.getUserIdAndVerifierFromExpiredToken(request);
    const { token } = payload;

    const refreshToken = await this.refreshTokensService.getRefreshToken(token);

    if (!refreshToken) {
      throw new BadTokenException();
    }

    await this.refreshTokensService.delete(token);

    if (refreshToken.user.id !== userId) {
      throw new BadTokenException();
    }

    if (refreshToken.id !== verifier) {
      throw new BadTokenException();
    }

    return refreshToken.user;
  }
}
