import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { CreateCommentCommand } from './commands/implementations/create-comment.command';
import { GetCommentsQuery } from './commands/implementations/get-comments.query';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:id/comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createComment(
    @Body() comment: CreateCommentDto,
    @Req() request: Request,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    const user = request.user;
    return this.commandBus.execute(
      new CreateCommentCommand(postId, comment, user),
    );
  }

  @Get()
  async getComments(
    @Param('id', ParseIntPipe) postId: number,
    @Query() { limit, offset, cursor }: PaginationParamsDto,
  ) {
    return this.queryBus.execute(
      new GetCommentsQuery(postId, { limit, offset, cursor }),
    );
  }
}
