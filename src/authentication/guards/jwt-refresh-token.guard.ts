import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_TOKEN_STRATEGY_NAME } from '../strategies/jwt-refresh-token.strategy';

@Injectable()
export default class JwtRefreshTokenGuard extends AuthGuard(
  JWT_REFRESH_TOKEN_STRATEGY_NAME,
) {}
