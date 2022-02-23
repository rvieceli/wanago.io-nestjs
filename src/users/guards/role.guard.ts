import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { Role } from '../role.enum';

export const RoleGuard = (...roles: Role[]): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      const active = await super.canActivate(context);

      if (!active) {
        return false;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user;

      return roles.some((role) => user.roles.includes(role));
    }
  }

  return mixin(RoleGuardMixin);
};
