import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { PostsSearchService } from './posts-search.service';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CategoriesModule, SearchModule],
  providers: [PostsService, PostsSearchService],
  controllers: [PostsController],
})
export class PostsModule {}
