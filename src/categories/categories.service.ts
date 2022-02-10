import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PAGE_LIMIT } from 'src/utils/constants';
import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';
import { FindManyOptions, MoreThan, Raw, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Category } from './entities/category.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async getAllCategories(
    pagination: PaginationParamsDto = { limit: PAGE_LIMIT },
  ) {
    const order: FindManyOptions<Category>['order'] = { id: 'ASC' };
    const take =
      pagination.limit && pagination.limit <= PAGE_LIMIT
        ? pagination.limit
        : PAGE_LIMIT;

    if (pagination.cursor) {
      const count = await this.categoriesRepository.count();
      const items = await this.categoriesRepository.find({
        where: { id: MoreThan(pagination.cursor) },
        order,
        take,
      });

      return {
        items,
        count,
      };
    }

    const [items, count] = await this.categoriesRepository.findAndCount({
      order,
      skip: pagination.offset,
      take,
    });

    return {
      items,
      count,
    };
  }

  async getById(id: number) {
    const category = await this.categoriesRepository.findOne(id, {
      relations: ['posts'],
    });

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }

  async getByNamesOrCreate(names: string[]): Promise<Category[]> {
    const alreadyIn = await this.categoriesRepository.find({
      where: {
        name: Raw((alias) => `LOWER(${alias}) IN (:...names)`, {
          names: names.map((n) => n.toLowerCase()),
        }),
      },
    });

    const forCreating = names
      .filter(
        (name) =>
          !alreadyIn.some(
            (category) => category.name.toLowerCase() === name.toLowerCase(),
          ),
      )
      .map((name) => ({ name }));

    if (!forCreating.length) {
      return alreadyIn;
    }

    const newOnes = this.categoriesRepository.create(forCreating);

    await this.categoriesRepository.save(newOnes);

    return [...alreadyIn, ...newOnes];
  }

  async updateCategory(id: number, category: UpdateCategoryDto) {
    const current = await this.categoriesRepository.findOne(id);

    if (!current) {
      throw new CategoryNotFoundException(id);
    }

    const updated = await this.categoriesRepository.save({
      ...current,
      ...category,
    });

    return updated;
  }
}
