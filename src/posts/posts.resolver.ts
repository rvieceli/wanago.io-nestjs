import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Request } from 'express';
import { GqlJwtAuthenticationGuard } from 'src/authentication/guards/gql-jwt-authentication.guard';
import { User } from 'src/users/models/user.model';
import { CreatePostInput } from './inputs/create-post.input';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';
import { GraphQLResolveInfo } from 'graphql';

import { relationsFromInfo } from 'src/utils/graphql/relations-from-info';
import { UsersLoader } from 'src/users/loaders/users.loader';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';

const POST_ADDED_EVENT = 'postAdded';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private postsService: PostsService,
    @Inject(PUB_SUB)
    private pubSub: RedisPubSub,
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
  async getAuthor(
    @Parent() post: Post,
    @Context('usersLoader') usersLoader: UsersLoader,
  ) {
    if (post.author) {
      return post.author;
    }
    return usersLoader.batchUsers.load(post.author_id);
  }

  @Mutation(() => Post)
  @UseGuards(GqlJwtAuthenticationGuard)
  async createPost(
    @Args('input') createPostInput: CreatePostInput,
    @Context('req') request: Request,
  ) {
    const newPost = await this.postsService.createPost(
      createPostInput,
      request.user,
    );

    await this.pubSub.publish(POST_ADDED_EVENT, { postAdded: newPost });

    return newPost;
  }

  @Subscription(() => Post)
  postAdded() {
    return this.pubSub.asyncIterator(POST_ADDED_EVENT);
  }
}
