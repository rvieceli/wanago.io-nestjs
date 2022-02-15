import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {
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
