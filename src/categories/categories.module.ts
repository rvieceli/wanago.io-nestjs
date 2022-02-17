import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesLoader } from './loaders/categories.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService, CategoriesLoader],
  exports: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
