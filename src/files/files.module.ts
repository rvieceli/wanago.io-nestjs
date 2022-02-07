import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudStorageModule } from 'src/cloud-storage/cloud-storage.module';
import { PrivateFile } from './entities/private-file.entity';
import { PublicFile } from './entities/public-file.entity';
import { FilesService } from './files.service';
import { PrivateFilesService } from './private-files.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PublicFile, PrivateFile]),
    CloudStorageModule,
  ],
  providers: [FilesService, PrivateFilesService],
  exports: [FilesService, PrivateFilesService],
})
export class FilesModule {}
