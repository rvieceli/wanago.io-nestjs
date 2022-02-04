import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';

import * as request from 'supertest';
import { mocked } from 'jest-mock';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PostgresErrorCodes } from 'src/database/postgres-error-codes.enum';
import { mockedConfigService } from 'src/utils/mocks/config.service';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { mockedUser } from './mocks/user.mock';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

jest.mock('bcrypt');

describe('AuthenticationController', () => {
  let app: INestApplication;
  let authenticationService: AuthenticationService;
  let userData: User;
  let jwtToken: string;
  let create: jest.Mock;

  beforeEach(async () => {
    userData = new User();

    Object.assign(userData, {
      ...mockedUser,
    });

    mocked(bcrypt.compare).mockImplementation((a, b) => a === b);
    create = jest.fn().mockReturnValue(userData);

    const usersRepository = {
      create,
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue(userData),
    };

    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [AuthenticationController],
      providers: [
        UsersService,
        LocalStrategy,
        JwtStrategy,
        AuthenticationService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    authenticationService = module.get(AuthenticationService);

    await app.init();
  });

  describe('when registering', () => {
    describe('and using valid data', () => {
      it('should respond with the data of the user without the password', () => {
        const expectedData = {
          ...mockedUser,
        };

        delete expectedData.password;

        return request(app.getHttpServer())
          .post('/sessions/register')
          .send({
            email: mockedUser.email,
            name: mockedUser.name,
            password: 'some$password',
          })
          .expect(201)
          .expect(expectedData);
      });
    });

    describe('and using invalid data', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/sessions/register')
          .send({
            name: mockedUser.name,
          })
          .expect(400);
      });
    });

    describe('and using email that already exists', () => {
      beforeEach(() => {
        create.mockImplementation(() => {
          throw new QueryFailedError('', [], {
            code: PostgresErrorCodes.UniqueValidation,
          });
        });
      });

      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/sessions/register')
          .send({
            email: mockedUser.email,
            name: mockedUser.name,
            password: 'some$password',
          })
          .expect(400);
      });
    });

    describe('and create had unknown error', () => {
      beforeEach(() => {
        create.mockImplementation(() => {
          throw undefined;
        });
      });

      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/sessions/register')
          .send({
            email: mockedUser.email,
            name: mockedUser.name,
            password: 'some$password',
          })
          .expect(500);
      });
    });
  });

  describe('when login', () => {
    describe('and using valid credentials', () => {
      it('should respond with user and jwt token', () => {
        const expectedData = {
          ...mockedUser,
        };

        delete expectedData.password;

        return request(app.getHttpServer())
          .post('/sessions')
          .send({
            email: mockedUser.email,
            password: 'some$password',
          })
          .expect(200)
          .then(({ body }) => {
            expect(body.user).toEqual(expect.objectContaining(expectedData));

            expect(body.token).toEqual(
              expect.stringMatching(/^[\w-]*\.[\w-]*\.[\w-]*$/),
            );
          });
      });
    });

    describe('and using invalid credentials', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer())
          .post('/sessions')
          .send({
            email: 'wrong@email.com',
            password: 'or$password',
          })
          .expect(400);
      });
    });
  });

  describe('when requesting protected url', () => {
    describe('and using valid token', () => {
      beforeEach(() => {
        jwtToken = authenticationService.getToken(mockedUser);
      });

      it('should respond with user information', () => {
        const expectedData = {
          ...mockedUser,
        };

        delete expectedData.password;

        return request(app.getHttpServer())
          .get('/sessions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(200)
          .expect(expectedData);
      });
    });

    describe('and using invalid token', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer())
          .get('/sessions')
          .set(
            'Authorization',
            `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
          )
          .send()
          .expect(401);
      });
    });

    describe('and without token', () => {
      it('should throw an error', () => {
        return request(app.getHttpServer()).get('/sessions').send().expect(401);
      });
    });
  });

  describe('when logout', () => {
    describe('and using valid token', () => {
      beforeEach(() => {
        jwtToken = authenticationService.getToken(mockedUser);
      });

      it('should respond with user information', () => {
        return request(app.getHttpServer())
          .delete('/sessions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(200);
      });
    });
  });
});
