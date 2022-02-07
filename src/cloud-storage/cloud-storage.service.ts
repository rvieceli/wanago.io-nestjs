import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { EnvironmentVariables } from 'src/configuration/environment-variables.interface';

interface UploadParams {
  buffer: Buffer;
  key: string;
  contentType: string;
  acl?: 'private' | 'public';
}

@Injectable()
export class CloudStorageService {
  private instance: S3;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.instance = new S3({
      credentials: {
        accessKeyId: configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_S3_SECRET_KEY'),
      },
      region: configService.get('AWS_S3_REGION'),
    });
  }

  async upload(params: UploadParams) {
    return this.instance
      .upload({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Body: params.buffer,
        Key: params.key,
        ACL: params.acl === 'public' ? 'public-read' : 'private',
        ContentType: params.contentType,
      })
      .promise();
  }

  async delete(key: string) {
    return this.instance
      .deleteObject({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
      })
      .promise();
  }

  async get(key: string) {
    return this.instance
      .getObject({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
      })
      .createReadStream();
  }

  async getSignedUrl(key: string) {
    return this.instance.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    });
  }
}
