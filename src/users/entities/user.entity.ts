import { Exclude } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { PrivateFile } from 'src/files/entities/private-file.entity';
import { PublicFile } from 'src/files/entities/public-file.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  @Exclude()
  password: string;

  @OneToOne(() => Address, {
    cascade: true,
  })
  @JoinColumn()
  address: Address;

  @OneToMany(() => Post, (post) => post.author)
  posts?: Post[];

  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  avatar?: PublicFile;

  @OneToMany(() => PrivateFile, (file) => file.owner)
  files?: PrivateFile[];

  @Exclude()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens?: RefreshToken[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments?: Comment[];

  @Column({ nullable: true })
  two_factors_authentication_secret?: string;

  @Column({ nullable: true })
  is_2fa_enabled?: boolean;
}
