import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { CategoriesService } from '../categories.service';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesLoader {
  constructor(private categoriesService: CategoriesService) {}

  readonly batchCategories = new DataLoader(async (ids: number[]) => {
    const categories = await this.categoriesService.getByIds(ids);
    const categoriesMap = new Map(
      categories.map((category) => [category.id, category]),
    );

    return ids.map((id) => categoriesMap.get(id));
  });
}
