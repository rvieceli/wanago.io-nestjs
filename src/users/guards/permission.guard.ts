import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { Permission } from '../permission.type';

export const PermissionGuard = (permission: Permission): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      const active = await super.canActivate(context);

      if (!active) {
        return false;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user;

      return user.permissions?.includes(permission);
    }
  }

  return mixin(PermissionGuardMixin);
};
