import { User } from '../entities/user.entity';

export class CreateRefreshTokenDto {
  token: string;
  userAgent: string;
  user: Pick<User, 'id'> & Partial<Omit<User, 'id'>>;
  expiration?: Date;
}
