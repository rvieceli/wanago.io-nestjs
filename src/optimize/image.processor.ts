import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JobData } from './interfaces/job-data.interface';
import * as AdmZip from 'adm-zip';
import imageminPng from 'imagemin-pngquant';

import { buffer } from 'imagemin';

@Processor('image')
export class ImageProcessor {
  @Process('optimize')
  async handleOptimization(job: Job<JobData>) {
    const files = job.data.files;

    const optimizationPromises: Promise<Buffer>[] = files.map((file) => {
      const fileBuffer = Buffer.from(file.buffer);

      return buffer(fileBuffer, {
        plugins: [
          imageminPng({
            quality: [0.6, 0.8],
          }),
        ],
      });
    });

    const optimizedImages = await Promise.all(optimizationPromises);

    const zip = new AdmZip();

    optimizedImages.forEach((image, index) => {
      const fileData = files[index];
      zip.addFile(fileData.originalname, image);
    });

    return zip.toBuffer();
  }
}
