import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import * as request from 'supertest';
import { mocked } from 'jest-mock';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { mockedConfigService } from 'src/utils/mocks/config.service';
import { mockedJwtService } from 'src/utils/mocks/jwt.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { mockedUser } from './mocks/user.mock';
import { LocalStrategy } from './strategies/local.strategy';

jest.mock('bcrypt');

describe('AuthenticationController', () => {
  let app: INestApplication;
  let userData: User;

  beforeEach(async () => {
    userData = new User();

    Object.assign(userData, {
      ...mockedUser,
    });

    mocked(bcrypt.compare).mockImplementation((a, b) => a === b);

    const usersRepository = {
      create: jest.fn().mockResolvedValue(userData),
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue(userData),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        UsersService,
        LocalStrategy,
        AuthenticationService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: {
            ...mockedJwtService,
            sign: () => 'jwt.token.signed',
          },
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
          .post('/authentication/register')
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
          .post('/authentication/register')
          .send({
            name: mockedUser.name,
          })
          .expect(400);
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
          .post('/authentication/login')
          .send({
            email: mockedUser.email,
            password: 'some$password',
          })
          .expect(200)
          .expect({ user: expectedData, token: 'jwt.token.signed' });
      });
    });

    describe('and using invalid credentials', () => {
      it('should throw and error', () => {
        return request(app.getHttpServer())
          .post('/authentication/login')
          .send({
            email: 'wrong@email.com',
            password: 'or$password',
          })
          .expect(400);
      });
    });
  });
});
