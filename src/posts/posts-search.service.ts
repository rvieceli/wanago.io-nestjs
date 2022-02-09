import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Post } from './entities/post.entity';
import { PostSearchBody } from './interfaces/post-search-body.interface';
import { PostSearchResult } from './interfaces/post-search-result.interface';

@Injectable()
export class PostsSearchService {
  private index = 'posts';

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

  async search(text: string) {
    const { body } = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'paragraphs'],
          },
        },
      },
    });

    const hits = body.hits.hits;

    return hits.map((item) => item._source);
  }
}
