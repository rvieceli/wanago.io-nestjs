import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  token: string;

  @Column()
  userAgent: string;

  @Column({ type: 'timestamp' })
  expiration: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
