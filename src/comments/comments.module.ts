import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CreateCommentHandler } from './commands/handlers/create-comment.handler';
import { GetCommentsHandler } from './commands/handlers/get-comments.handler';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CqrsModule,
    AuthenticationModule,
  ],
  controllers: [CommentsController],
  providers: [CreateCommentHandler, GetCommentsHandler],
})
export class CommentsModule {}
