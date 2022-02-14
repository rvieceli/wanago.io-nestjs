import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { Address } from './entities/address.entity';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, RefreshToken]),
    FilesModule,
    ConfigurationModule,
    forwardRef(() => AuthenticationModule),
  ],
  providers: [UsersService, RefreshTokensService],
  exports: [UsersService, RefreshTokensService],
  controllers: [UsersController],
})
export class UsersModule {}
