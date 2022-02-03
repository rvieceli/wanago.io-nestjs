import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Post } from './entities/post.entity';
import { PostNotFoundException } from './exceptions/post-not-found.exception';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['author'] });
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });

    if (!post) {
      throw new PostNotFoundException(id);
    }

    return post;
  }

  async createPost(post: CreatePostDto, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
      author: user,
    });

    await this.postsRepository.save(newPost);

    return newPost;
  }

  async updatePost(id: number, post: UpdatePostDto): Promise<Post> {
    const current = await this.postsRepository.findOne(id);

    if (!current) {
      throw new PostNotFoundException(id);
    }

    const updated = await this.postsRepository.save({
      ...current,
      ...post,
    });

    return updated;
  }

  async deletePost(id: number): Promise<void> {
    const post = await this.postsRepository.findOne(id);
    if (post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    await this.postsRepository.delete(id);
  }
}
