import { User } from 'src/users/entities/user.entity';

export class DeleteCommentCommand {
  constructor(
    public readonly author: User,
    public readonly commentId: number,
  ) {}
}
