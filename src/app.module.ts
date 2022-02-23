import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

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
import { ApolloModule } from './apollo/apollo.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';
import { QueueModule } from './queue/queue.module';
import { OptimizeModule } from './optimize/optimize.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';

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
    ApolloModule,
    PubSubModule,
    TwoFactorAuthenticationModule,
    QueueModule,
    OptimizeModule,
    EmailConfirmationModule,
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
  ],
})
export class AppModule {}
