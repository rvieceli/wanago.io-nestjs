import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

import { CategoriesModule } from 'src/categories/categories.module';
import { SearchModule } from 'src/search/search.module';

import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { PostsSearchService } from './posts-search.service';
import {
  ConfigurationModule,
  ConfigurationService,
} from 'src/configuration/configuration.module';
import { PostsResolver } from './posts.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        store: redisStore,
        socket: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
        ttl: 10,
        max: 100,
      }),
    }),
    TypeOrmModule.forFeature([Post]),
    CategoriesModule,
    SearchModule,
    UsersModule,
  ],
  providers: [PostsService, PostsSearchService, PostsResolver],
  controllers: [PostsController],
})
export class PostsModule {}
