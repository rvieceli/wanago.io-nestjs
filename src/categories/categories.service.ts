import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Category } from './entities/category.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async getAllCategories() {
    return this.categoriesRepository.find({ relations: ['posts'] });
  }

  async getCategoryById(id: number) {
    const category = await this.categoriesRepository.findOne(id, {
      relations: ['posts'],
    });

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }

  async getCategoryByNameOrCreate(names: string[]): Promise<Category[]> {
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
