import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { DeleteCommentCommand } from '../implementations/delete-comment.command';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const comment = await this.commentsRepository.findOne(command.commentId);

    if (!comment) {
      throw new NotFoundException('Comment this this id does not exist.');
    }

    if (comment.author_id !== command.author.id) {
      throw new ForbiddenException('Operation not permitted.');
    }

    await this.commentsRepository.softDelete({
      id: command.commentId,
    });
  }
}
