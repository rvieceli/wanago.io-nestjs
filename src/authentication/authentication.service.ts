import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { EnvironmentVariables } from 'src/configuration/environment-variables.interface';
import { PostgresErrorCodes } from 'src/database/postgres-error-codes.enum';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenPayload } from './interfaces/jwt-token-payload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
    private usersService: UsersService,
  ) {}

  async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);

    try {
      const newUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });

      newUser.password = undefined;

      return newUser;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueValidation) {
        throw new HttpException(
          'User already exists with this email',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAuthenticatedUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.getUserByEmail(email);

      await this.verifyPassword(password, user.password);

      user.password = undefined;

      return user;
    } catch (error) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPassword(incomingPassword: string, hashedUserPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      incomingPassword,
      hashedUserPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  getToken(user: Express.User): string {
    const payload: JwtTokenPayload = { sub: user.id };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });
  }
}
