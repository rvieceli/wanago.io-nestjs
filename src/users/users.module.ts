import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { Address } from './entities/address.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, RefreshToken]),
    FilesModule,
    ConfigModule,
  ],
  providers: [UsersService, RefreshTokensService],
  exports: [UsersService, RefreshTokensService],
  controllers: [UsersController],
})
export class UsersModule {}
