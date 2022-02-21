import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { OptimizeController } from './optimize.controller';
import { ImageProcessor } from './image.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image',
    }),
  ],
  providers: [ImageProcessor],
  controllers: [OptimizeController],
})
export class OptimizeModule {}
