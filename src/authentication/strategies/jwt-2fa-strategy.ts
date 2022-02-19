import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Socket } from 'socket.io';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const JWT_2FA_STRATEGY = 'jwt-2fa';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(
  Strategy,
  JWT_2FA_STRATEGY,
) {
  constructor(
    private usersService: UsersService,
    configService: ConfigurationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request | Socket) => {
          if (request instanceof Socket) {
            return request.handshake.auth?.token;
          }
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(request: Request, payload: JwtPayload) {
    request._verifier = payload.verifier;

    const user = await this.usersService.getById(payload.sub);

    if (!user.is_2fa_enabled) {
      return user;
    }

    if (payload.is2fa) {
      return user;
    }
  }
}
