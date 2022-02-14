import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Cluster } from './cluster';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
// Cluster.register(1, bootstrap);
