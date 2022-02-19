import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { UsersModule } from 'src/users/users.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [ConfigurationModule, UsersModule, AuthenticationModule],
  providers: [TwoFactorAuthenticationService],
  controllers: [TwoFactorAuthenticationController],
})
export class TwoFactorAuthenticationModule {}
