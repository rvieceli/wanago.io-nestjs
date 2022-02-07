import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PrivateFile } from './entities/private-file.entity';

@Injectable()
export class PrivateFilesService {
  constructor(
    @InjectRepository(PrivateFile)
    private privateFilesRepository: Repository<PrivateFile>,
    private cloudStorageService: CloudStorageService,
  ) {}
  async uploadPrivateFile(
    dataBuffer: Buffer,
    ownerId: number,
    filename: string,
    contentType: string,
  ) {
    const uploadResult = await this.cloudStorageService.upload({
      buffer: dataBuffer,
      key: `private/${uuid()}-${filename}`,
      contentType: contentType,
    });

    const newFile = this.privateFilesRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId,
      },
    });

    await this.privateFilesRepository.save(newFile);

    return newFile;
  }

  async getPrivateFile(id: number) {
    const file = await this.privateFilesRepository.findOne(id, {
      relations: ['owner'],
    });

    if (!file) {
      throw new NotFoundException();
    }

    const stream = await this.cloudStorageService.get(file.key);

    return { stream, info: file };
  }

  async generatePresignedUrl(key: string) {
    return this.cloudStorageService.getSignedUrl(key);
  }
}
