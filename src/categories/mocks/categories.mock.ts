import { plainToClass } from 'class-transformer';
import { Category } from '../entities/category.entity';

export const mockedCategories: Category[] = [
  plainToClass(Category, {
    id: 1,
    name: 'Life',
  }),
  plainToClass(Category, {
    id: 2,
    name: 'Travel',
  }),
  plainToClass(Category, {
    id: 3,
    name: 'Food',
  }),
];

export const mockedCategory: Category = plainToClass(Category, {
  id: 4,
  name: 'New Category',
});
