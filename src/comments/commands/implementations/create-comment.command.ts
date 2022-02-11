import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from '../../dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly postId: number,
    public readonly comment: CreateCommentDto,
    public readonly author: User,
  ) {}
}
