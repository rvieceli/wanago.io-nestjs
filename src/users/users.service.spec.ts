import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne,
          },
        },
      ],
    }).compile();

    usersService = module.get(UsersService);
  });

  describe('when getting a user by email', () => {
    describe('and the user is matched', () => {
      let user: User;

      beforeEach(() => {
        user = new User();
        findOne.mockResolvedValue(user);
      });

      it('should return the user', async () => {
        const fetched = await usersService.getByEmail('some@user.com');
        expect(fetched).toEqual(user);
      });
    });

    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockResolvedValue(undefined);
      });

      it('should throw an error', async () => {
        await expect(
          usersService.getByEmail('some@user.com'),
        ).rejects.toThrow();
      });
    });
  });

  describe('when getting a user by id', () => {
    describe('and the user exists', () => {
      let user: User;

      beforeEach(() => {
        user = new User();
        findOne.mockResolvedValue(user);
      });

      it('should return the user', async () => {
        const fetched = await usersService.getById(1);
        expect(fetched).toEqual(user);
      });
    });

    describe('and the user not exists', () => {
      beforeEach(() => {
        findOne.mockResolvedValue(undefined);
      });

      it('should throw an error', async () => {
        await expect(usersService.getById(0)).rejects.toThrow();
      });
    });
  });
});
