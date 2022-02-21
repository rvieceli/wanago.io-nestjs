import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import {
  ConfigurationModule,
  ConfigurationService,
} from 'src/configuration/configuration.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: async (configService: ConfigurationService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          keyPrefix: 'QUEUE',
        },
      }),
    }),
  ],
})
export class QueueModule {}
