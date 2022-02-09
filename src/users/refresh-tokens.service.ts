import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/configuration/environment-variables.interface';
import { Repository } from 'typeorm';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import ms = require('ms');

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async create(data: CreateRefreshTokenDto) {
    if (!data.expiration) {
      const expiresIn =
        Date.now() + ms(this.configService.get('JWT_REFRESH_EXPIRATION_TIME'));

      data.expiration = data.expiration || new Date(expiresIn);
    }

    const newToken = this.refreshTokensRepository.create(data);

    await this.refreshTokensRepository.save(newToken);

    return newToken;
  }

  async getRefreshToken(token: string) {
    const refreshToken = await this.refreshTokensRepository.findOne(
      {
        token,
      },
      { relations: ['user'] },
    );

    return refreshToken;
  }

  async delete(idOrToken: number | string) {
    const property = typeof idOrToken === 'number' ? 'id' : 'token';

    await this.refreshTokensRepository.delete({ [property]: idOrToken });
  }
}
