import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Cluster } from './cluster';
import { RedisIoAdapter } from './utils/adapters/redis-io.adapter';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  await app.listen(3000);
}

bootstrap();
// Cluster.register(2, bootstrap);
