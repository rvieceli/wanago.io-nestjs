import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field(() => [String])
  paragraphs: string[];

  @Field(() => [String])
  categories: string[];

  @Field({ nullable: true })
  scheduled_date?: Date;
}
