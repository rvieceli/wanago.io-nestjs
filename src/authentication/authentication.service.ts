import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PostgresErrorCodes } from 'src/database/postgres-error-codes.enum';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshPayload } from './interfaces/jwt-refresh-payload.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigurationService,
    private usersService: UsersService,
  ) {}

  async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);

    try {
      const newUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });

      // newUser.password = undefined;

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
      const user = await this.usersService.getByEmail(email);

      await this.verifyPassword(password, user.password);

      // user.password = undefined;

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

  getToken(user: User, verifier?: number): string {
    const payload: JwtPayload = { sub: user.id, verifier };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });
  }

  getRefreshToken(token: string): string {
    const payload: JwtRefreshPayload = { token };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });
  }

  async getTokens(user: User, userAgent: string) {
    const refreshTokenId = await this.usersService.createRefreshTokenId(
      user.id,
      userAgent,
    );

    const token = this.getToken(user, refreshTokenId.id);

    const refreshToken = this.getRefreshToken(refreshTokenId.token);

    return {
      token,
      refreshToken,
    };
  }

  async logOut(verifier: number) {
    this.usersService.removeRefreshToken(verifier);
  }
}
