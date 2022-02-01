import { Module } from '@nestjs/common';

import { PostsModule } from './posts/posts.module';
import { DatabaseModule } from './database/database.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { UsersModule } from './users/users.module';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [ConfigurationModule, PostsModule, DatabaseModule, UsersModule, AuthenticationModule],
  controllers: [],
  providers: [AuthenticationService],
})
export class AppModule {}
