import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentCommand } from '../implementations/create-comment.command';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async execute(command: CreateCommentCommand) {
    const newComment = this.commentsRepository.create({
      ...command.comment,
      post: {
        id: command.postId,
      },
      author: command.author,
    });

    await this.commentsRepository.save(newComment);

    return newComment;
  }
}
