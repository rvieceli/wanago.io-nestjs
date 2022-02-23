import {
  Body,
  CacheKey,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Jwt2faGuard } from 'src/authentication/guards/jwt-2fa.guard';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { PermissionGuard } from 'src/users/guards/permission.guard';
import { RoleGuard } from 'src/users/guards/role.guard';
import { Role } from 'src/users/role.enum';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { HttpCacheInterceptor } from 'src/utils/interceptors/http-cache.interceptor';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostPermission } from './permission.enum';
import { GET_POSTS_CACHE_KEY } from './posts.constants';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_POSTS_CACHE_KEY)
  @CacheTTL(120)
  async getAllPosts(
    @Query('search') search: string,
    @Query() { limit, offset, cursor }: PaginationParamsDto,
  ) {
    if (search) {
      return this.postsService.searchForPosts(search, {
        limit,
        offset,
        cursor,
      });
    }
    return this.postsService.getAllPosts({
      pagination: { limit, offset, cursor },
    });
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(Jwt2faGuard)
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
  @UseGuards(RoleGuard(Role.Admin))
  @UseGuards(PermissionGuard(PostPermission.DeletePost))
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    this.postsService.deletePost(id);
  }
}
