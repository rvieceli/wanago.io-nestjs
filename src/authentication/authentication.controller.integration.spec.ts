import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { mockedConfigService } from 'src/utils/mocks/config.service';
import { mockedJwtService } from 'src/utils/mocks/jwt.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { mockedUser } from './mocks/user.mock';

describe('AuthenticationController', () => {
  let app: INestApplication;
  let userData: User;

  beforeEach(async () => {
    userData = {
      ...mockedUser,
    };

    const usersRepository = {
      create: jest.fn().mockResolvedValue(userData),
      save: jest.fn().mockResolvedValue({}),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthenticationController],
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
          useValue: usersRepository,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  describe('when registering', () => {
    describe('and using valida data', () => {
      it('should respond with the data of the user without the password', () => {
        const expectedData = {
          ...userData,
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
});
