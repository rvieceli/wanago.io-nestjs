import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createPost(@Body() post: CreatePostDto, @Req() request: Request) {
    return this.postsService.createPost(post, request.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthenticationGuard)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() post: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, post);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    this.postsService.deletePost(id);
  }
}
