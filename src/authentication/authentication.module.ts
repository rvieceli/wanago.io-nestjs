import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/users/users.module';

import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthenticationController } from './authentication.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { Jwt2faStrategy } from './strategies/jwt-2fa-strategy';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';

@Module({
  imports: [
    ConfigurationModule,
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    EmailConfirmationModule,
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    Jwt2faStrategy,
  ],
  controllers: [AuthenticationController],
  exports: [PassportModule, AuthenticationService],
})
export class AuthenticationModule {}
