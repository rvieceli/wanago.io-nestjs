import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { User } from 'src/users/entities/user.entity';
import { PAGE_LIMIT } from 'src/utils/constants';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { In, Repository, FindManyOptions, MoreThan } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Post } from './entities/post.entity';
import { PostNotFoundException } from './exceptions/post-not-found.exception';
import { PostsSearchService } from './posts-search.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private categoriesService: CategoriesService,
    private postsSearchService: PostsSearchService,
  ) {}

  async getAllPosts(pagination: PaginationParamsDto) {
    const relations = ['author', 'categories'];
    const order: FindManyOptions<Post>['order'] = { id: 'ASC' };
    const take =
      pagination.limit && pagination.limit <= PAGE_LIMIT
        ? pagination.limit
        : PAGE_LIMIT;

    if (pagination.cursor) {
      const count = await this.postsRepository.count();
      const items = await this.postsRepository.find({
        where: { id: MoreThan(pagination.cursor) },
        relations,
        order,
        take,
      });

      return {
        items,
        count,
      };
    }

    const [items, count] = await this.postsRepository.findAndCount({
      relations,
      order,
      skip: pagination.offset,
      take,
    });

    return {
      items,
      count,
    };
  }

  async searchForPosts(text: string, pagination: PaginationParamsDto) {
    const { results, count } = await this.postsSearchService.search(
      text,
      pagination,
    );

    const ids = results.map((post) => post.id);

    if (!ids.length) {
      return {
        items: [],
        count,
      };
    }

    const items = await this.postsRepository.find({
      where: { id: In(ids) },
      relations: ['author', 'categories'],
    });

    return {
      items,
      count,
    };
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['author', 'categories'],
    });

    if (!post) {
      throw new PostNotFoundException(id);
    }

    return post;
  }

  async createPost(postData: CreatePostDto, user: User): Promise<Post> {
    const { categories: categoriesNames, ...fields } = postData;

    const categories = await this.categoriesService.getByNamesOrCreate(
      categoriesNames,
    );

    const newPost = this.postsRepository.create({
      ...fields,
      author: user,
      categories,
    });

    await this.postsRepository.save(newPost);

    await this.postsSearchService.indexPost(newPost);

    return newPost;
  }

  async updatePost(id: number, postData: UpdatePostDto): Promise<Post> {
    const current = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });

    if (!current) {
      throw new PostNotFoundException(id);
    }

    const { categories: categoriesNames, ...fields } = postData;

    if (categoriesNames) {
      const categories = await this.categoriesService.getByNamesOrCreate(
        categoriesNames,
      );

      Object.assign(fields, { categories });
    }

    const updated = await this.postsRepository.save({
      ...current,
      ...fields,
    });

    Object.assign(updated, {
      author: current.author,
    });

    await this.postsSearchService.update(updated);

    return updated;
  }

  async deletePost(id: number): Promise<void> {
    const post = await this.postsRepository.findOne(id);
    if (post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    await this.postsRepository.delete(id);
    await this.postsSearchService.remove(id);
  }
}
