import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';
import { JWT_2FA_STRATEGY } from '../strategies/jwt-2fa-strategy';

@Injectable()
export class Jwt2faGuard extends AuthGuard(JWT_2FA_STRATEGY) {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (context.getType() === 'ws' && !!user) {
      Object.assign(context.switchToWs().getClient<Socket>().data, {
        user,
      });
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
