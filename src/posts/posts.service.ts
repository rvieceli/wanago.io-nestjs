import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Post } from './post.interface';

@Injectable()
export class PostsService {
  private lastPostId = 1;
  private posts: Post[] = [];

  getAllPosts(): Post[] {
    return this.posts;
  }

  getPostById(id: number): Post | undefined {
    const post = this.posts.find((post) => post.id === id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }

  createPost(post: CreatePostDto): Post {
    const newPost: Post = {
      id: this.lastPostId++,
      ...post,
    };

    this.posts.push(newPost);

    return newPost;
  }

  updatePost(id: number, post: UpdatePostDto): Post {
    const editedPost = this.posts.find((post) => post.id === id);

    if (!editedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const properties = Object.keys(post) as Array<keyof UpdatePostDto>;

    for (const property of properties) {
      if (property in editedPost) {
        editedPost[property] = post[property];
      }
    }

    return editedPost;
  }

  deletePost(id: number): void {
    const postIndex = this.posts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    this.posts.splice(postIndex, 1);
  }
}
