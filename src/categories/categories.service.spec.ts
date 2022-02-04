import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { mockedCategories, mockedCategory } from './mocks/categories.mock';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let findOne: jest.Mock;
  let find: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    find = jest.fn().mockResolvedValue(mockedCategories);
    create = jest.fn().mockImplementation((p) => p);

    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne,
            find,
            create,
            save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
          },
        },
      ],
    }).compile();

    categoriesService = module.get(CategoriesService);
  });

  describe('when getting all categories', () => {
    it('should return all categories', async () => {
      const fetched = await categoriesService.getAllCategories();
      expect(fetched).toEqual(mockedCategories);
    });
  });

  describe('when getting a category by id', () => {
    describe('and the category exists', () => {
      let category: Category;

      beforeEach(() => {
        category = new Category();
        findOne.mockResolvedValue(category);
      });

      it('should return the category', async () => {
        const fetched = await categoriesService.getById(1);
        expect(fetched).toEqual(category);
      });
    });

    describe('and the category not exists', () => {
      beforeEach(() => {
        findOne.mockResolvedValue(undefined);
      });

      it('should throw an error', async () => {
        await expect(categoriesService.getById(0)).rejects.toThrow();
      });
    });
  });

  describe('when getting categories by name', () => {
    describe('and all names already exists', () => {
      it('should return the categories', async () => {
        const fetched = await categoriesService.getByNamesOrCreate([
          mockedCategories[0].name,
          mockedCategories[0].name,
          mockedCategories[1].name.toUpperCase(),
          mockedCategories[2].name.toLowerCase(),
        ]);
        expect(fetched).toEqual(mockedCategories);
      });
    });

    describe('when one of the names does not exists', () => {
      it('should return the categories', async () => {
        const fetched = await categoriesService.getByNamesOrCreate([
          mockedCategories[0].name,
          mockedCategories[1].name.toUpperCase(),
          mockedCategories[2].name.toLowerCase(),
          mockedCategory.name,
        ]);

        expect(fetched.map((c) => c.name)).toEqual([
          ...mockedCategories.map((c) => c.name),
          mockedCategory.name,
        ]);
      });
    });
  });

  describe('when updating a category', () => {
    describe('and the category exists', () => {
      beforeEach(() => {
        findOne.mockResolvedValue(mockedCategory);
      });

      it('should return the category', async () => {
        const name = 'Updated name';
        const fetched = await categoriesService.updateCategory(1, {
          name,
        });
        expect(fetched).toEqual({ ...mockedCategory, name });
      });
    });

    describe('and the category not exists', () => {
      beforeEach(() => {
        findOne.mockResolvedValue(undefined);
      });

      it('should throw an error', async () => {
        await expect(
          categoriesService.updateCategory(0, { name: 'Updated name' }),
        ).rejects.toThrow();
      });
    });
  });
});
