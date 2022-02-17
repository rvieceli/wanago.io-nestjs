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

  @Field(() => [Category])
  categories: Category[];
}
