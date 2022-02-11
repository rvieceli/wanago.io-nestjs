import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import { PAGE_LIMIT } from 'src/utils/constants';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import { GetCommentsQuery } from '../implementations/get-comments.query';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async execute(query: GetCommentsQuery): Promise<any> {
    const { postId, pagination = { limit: PAGE_LIMIT } } = query;

    const relations = ['author'];
    const order: FindManyOptions<Comment>['order'] = { id: 'ASC' };
    const take =
      pagination.limit && pagination.limit <= PAGE_LIMIT
        ? pagination.limit
        : PAGE_LIMIT;

    if (pagination.cursor) {
      const count = await this.commentsRepository.count();
      const items = await this.commentsRepository.find({
        where: {
          id: MoreThan(pagination.cursor),
          post: {
            id: postId,
          },
        },
        relations,
        order,
        take,
      });

      return {
        items,
        count,
      };
    }

    const [items, count] = await this.commentsRepository.findAndCount({
      where: {
        post: {
          id: postId,
        },
      },
      order,
      skip: pagination.offset,
      take,
    });

    return {
      items,
      count,
    };
  }
}
