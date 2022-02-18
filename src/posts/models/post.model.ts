import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Category } from 'src/categories/models/category.model';
import { User } from 'src/users/models/user.model';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field(() => [String])
  paragraphs: string[];

  @Field()
  author: User;

  @Field(() => Int)
  author_id: number;

  @Field(() => [Category])
  categories: Category[];

  @Field()
  created_at: Date;

  @Field({ nullable: true })
  scheduled_date?: Date;
}
