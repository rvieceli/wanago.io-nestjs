import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(
    @Query() { limit, offset, cursor }: PaginationParamsDto,
  ) {
    return this.categoriesService.getAllCategories({ limit, offset, cursor });
  }

  @Get(':id')
  async(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getById(id);
  }

  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() categoryData: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, categoryData);
  }
}
