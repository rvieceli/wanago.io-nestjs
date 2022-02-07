import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PublicFile } from './entities/public-file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private publicFilesRepository: Repository<PublicFile>,
    private cloudStorageService: CloudStorageService,
  ) {}

  async updatePublicFile(
    dataBuffer: Buffer,
    filename: string,
    contentType: string,
  ) {
    const uploadResult = await this.cloudStorageService.upload({
      buffer: dataBuffer,
      key: `public/${uuid()}-${filename}`,
      contentType,
      acl: 'public',
    });

    const newFile = this.publicFilesRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });

    await this.publicFilesRepository.save(newFile);

    return newFile;
  }

  async deletePublicFile(id: number) {
    const file = await this.publicFilesRepository.findOne(id);

    if (!file) {
      return;
    }

    await this.cloudStorageService.delete(file.key);

    await this.publicFilesRepository.delete(id);
  }
}
