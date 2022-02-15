import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { PostsModule } from './posts/posts.module';
import { DatabaseModule } from './database/database.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ExceptionLoggerFilter } from './utils/filters/exception-logger.filter';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { CategoriesModule } from './categories/categories.module';
import { FilesModule } from './files/files.module';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { SearchModule } from './search/search.module';
import { CommentsModule } from './comments/comments.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailScheduleModule } from './email-schedule/email-schedule.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    PostsModule,
    UsersModule,
    AuthenticationModule,
    CategoriesModule,
    CloudStorageModule,
    FilesModule,
    SearchModule,
    CommentsModule,
    EmailModule,
    ScheduleModule.forRoot(),
    EmailScheduleModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionLoggerFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
