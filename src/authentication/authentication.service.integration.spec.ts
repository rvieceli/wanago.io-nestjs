import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { mocked } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from '@nestjs/config';
import { mockedConfigService } from 'src/utils/mocks/config.service';
import { JwtService } from '@nestjs/jwt';
import { mockedJwtService } from 'src/utils/mocks/jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('bcrypt');

const mockedUser: User = {
  id: 1,
  email: 'some@user.com',
  name: 'Some',
  password: 'some$password',
  address: {
    id: 1,
    street: 'Some street, 23',
    city: 'City',
    country: 'Country',
  },
};

describe('AuthenticationService integration', () => {
  let authenticationService: AuthenticationService;
  let usersService: UsersService;
  let bcryptCompare: jest.Mock;
  let findUser: jest.Mock;
  let userData: User;

  beforeEach(async () => {
    bcryptCompare = jest.fn().mockReturnValue(true);

    mocked(bcrypt.compare).mockImplementation(bcryptCompare);

    userData = {
      ...mockedUser,
    };

    findUser = jest.fn().mockResolvedValue(userData);

    const userRepository = {
      findOne: findUser,
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthenticationService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    authenticationService = module.get(AuthenticationService);
    usersService = module.get(UsersService);
  });

  describe('when accessing the data of authenticating user', () => {
    it('should attempt to get the user by email', async () => {
      const getByEmailSpy = jest.spyOn(usersService, 'getByEmail');
      await authenticationService.getAuthenticatedUser(
        'some@user.com',
        'some$password',
      );

      expect(getByEmailSpy).toBeCalledTimes(1);
    });

    describe('and the provided password is not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false);
      });

      it('should thrown an error', async () => {
        await expect(
          authenticationService.getAuthenticatedUser(
            'some@user.com',
            'wrong$password',
          ),
        ).rejects.toThrow();
      });
    });

    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true);
      });

      describe('and user is found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(userData);
        });

        it('it should return the user data', async () => {
          const user = await authenticationService.getAuthenticatedUser(
            'some@user.com',
            'some$password',
          );

          expect(user).toBe(userData);
        });
      });

      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(undefined);
        });

        it('should thrown an error', async () => {
          await expect(
            authenticationService.getAuthenticatedUser(
              'not@found.com',
              'some$password',
            ),
          ).rejects.toThrow();
        });
      });
    });
  });
});
