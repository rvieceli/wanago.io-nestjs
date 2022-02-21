import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
  ConfigurationModule,
  ConfigurationService,
} from 'src/configuration/configuration.module';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => {
        return new RedisPubSub({
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            keyPrefix: PUB_SUB,
          },
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
