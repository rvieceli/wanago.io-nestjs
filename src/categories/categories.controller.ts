import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionGuard } from 'src/users/guards/permission.guard';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryPermission } from './permission.enum';

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
  @UseGuards(PermissionGuard(CategoryPermission.UpdateCategory))
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() categoryData: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, categoryData);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard(CategoryPermission.DeleteCategory))
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.deleteCategory(id);
  }
}
