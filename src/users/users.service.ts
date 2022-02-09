import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FilesService } from 'src/files/files.service';
import { PrivateFilesService } from 'src/files/private-files.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private filesService: FilesService,
    private privateFilesService: PrivateFilesService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(user);

    await this.usersRepository.save(newUser);

    return newUser;
  }

  async addAvatar(
    id: number,
    imageBuffer: Buffer,
    filename: string,
    contentType: string,
  ) {
    const user = await this.getById(id);

    const avatar = await this.filesService.updatePublicFile(
      imageBuffer,
      filename,
      contentType,
    );

    await this.usersRepository.update(id, {
      avatar,
    });

    if (user.avatar) {
      await this.filesService.deletePublicFile(user.avatar.id);
    }

    return avatar;
  }

  async deleteAvatar(id: number) {
    const user = await this.getById(id);

    if (user.avatar) {
      await this.usersRepository.update(id, {
        avatar: null,
      });
      await this.filesService.deletePublicFile(user.avatar.id);
    }
  }

  async addPrivateFile(
    id: number,
    file: Buffer,
    filename: string,
    contentType: string,
  ) {
    return this.privateFilesService.uploadPrivateFile(
      file,
      id,
      filename,
      contentType,
    );
  }

  async getPrivateFile(userId: number, fileId: number) {
    const file = await this.privateFilesService.getPrivateFile(fileId);

    if (file.info.owner.id !== userId) {
      throw new UnauthorizedException();
    }

    return file;
  }

  async getAllPrivateFiles(userId: number) {
    const userWithFiles = await this.usersRepository.findOne(userId, {
      relations: ['files'],
    });

    if (!userWithFiles) {
      throw new NotFoundException('User this this id does not exist');
    }

    return Promise.all(
      userWithFiles.files.map(async (file) => {
        const url = await this.privateFilesService.generatePresignedUrl(
          file.key,
        );
        return {
          ...file,
          url,
        };
      }),
    );
  }

  async createRefreshTokenId(userId: number, userAgent: string) {
    const token = randomUUID();

    return this.refreshTokensService.create({
      user: { id: userId },
      token,
      userAgent,
    });
  }

  async removeRefreshToken(idOrToken: string | number) {
    await this.refreshTokensService.delete(idOrToken);
  }
}
