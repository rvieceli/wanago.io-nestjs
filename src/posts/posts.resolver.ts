import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Request } from 'express';
import { GqlJwtAuthenticationGuard } from 'src/authentication/guards/gql-jwt-authentication.guard';
import { User } from 'src/users/models/user.model';
import { CreatePostInput } from './inputs/create-post.input';
import { Post } from './models/post.model';
import { Post as PostEntity } from './entities/post.entity';
import { PostsService } from './posts.service';
import { GraphQLResolveInfo } from 'graphql';

import { relationsFromInfo } from 'src/utils/graphql/relations-from-info';
import { UsersLoader } from 'src/users/loaders/users.loader';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private postsService: PostsService,
    private usersLoader: UsersLoader,
  ) {}

  @Query(() => [Post])
  async posts(@Info() info: GraphQLResolveInfo) {
    const relations = relationsFromInfo(['author', 'categories'], info);

    const posts = await this.postsService.getAllPosts({
      relations: relations,
    });

    return posts.items;
  }

  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: PostEntity) {
    if (post.author) {
      return post.author;
    }
    return this.usersLoader.batchUsers.load(post.author_id);
  }

  @Mutation(() => Post)
  @UseGuards(GqlJwtAuthenticationGuard)
  async createPost(
    @Args('input') createPostInput: CreatePostInput,
    @Context('req') request: Request,
  ) {
    return this.postsService.createPost(createPostInput, request.user);
  }
}
