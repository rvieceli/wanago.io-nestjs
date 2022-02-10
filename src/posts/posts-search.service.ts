import { RequestEvent } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PAGE_LIMIT } from 'src/utils/constants';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { Post } from './entities/post.entity';
import { PostSearchBody } from './interfaces/post-search-body.interface';
import { PostSearchResult } from './interfaces/post-search-result.interface';

@Injectable()
export class PostsSearchService {
  private index = 'posts';
  private fields = ['title', 'paragraphs'];

  constructor(private elasticsearchService: ElasticsearchService) {}

  async indexPost(post: Post) {
    return this.elasticsearchService.index<PostSearchResult, PostSearchBody>(
      {
        index: this.index,
        id: String(post.id), // we should use uuid
        body: {
          id: post.id,
          title: post.title,
          paragraphs: post.paragraphs,
          authorId: post.author.id,
        },
      },
      {},
    );
  }

  async remove(id: number) {
    return this.elasticsearchService.delete({
      index: this.index,
      id: String(id),
    });
  }

  async update(post: Post) {
    return this.elasticsearchService.update(
      {
        index: this.index,
        id: String(post.id),
        body: {
          doc: {
            id: post.id,
            title: post.title,
            paragraphs: post.paragraphs,
            authorId: post.author.id,
          },
          doc_as_upsert: true,
        },
      },
      {},
    );
  }

  async search(
    text: string,
    pagination: PaginationParamsDto = { limit: PAGE_LIMIT },
  ) {
    const query = {
      multi_match: {
        query: text,
        fields: this.fields,
      },
    };
    const sort = {
      id: {
        order: 'asc',
      },
    };

    if (pagination.cursor) {
      const response = await this.elasticsearchService.search<PostSearchResult>(
        {
          index: this.index,
          size: pagination.limit,
          body: {
            query,
            sort,
            search_after: [pagination.cursor],
          },
        },
      );

      return this.format(response.body);
    }

    const response = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      from: pagination.offset,
      size: pagination.limit,
      body: {
        query,
        sort,
      },
    });

    return this.format(response.body);
  }

  private format(body: RequestEvent<PostSearchResult>['body'], count?: number) {
    const hits = body.hits.hits;
    const results = hits.map((item) => item._source);

    return {
      results,
      count: count || body.hits.total.value,
    };
  }
}
