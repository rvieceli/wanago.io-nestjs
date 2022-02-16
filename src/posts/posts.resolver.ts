import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { GqlJwtAuthenticationGuard } from 'src/authentication/guards/gql-jwt-authentication.guard';
import { CreatePostInput } from './inputs/create-post.input';
import { Post } from './models/post.model';
import { PostsService } from './posts.service';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query(() => [Post])
  async posts() {
    const posts = await this.postsService.getAllPosts();

    return posts.items;
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
