import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
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

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['author', 'categories'] });
  }

  async searchForPosts(text: string) {
    const results = await this.postsSearchService.search(text);

    const ids = results.map((post) => post.id);

    if (!ids.length) {
      return [];
    }

    return this.postsRepository.find({
      where: { id: In(ids) },
      relations: ['author', 'categories'],
    });
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

    console.log({ updated });

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
