import { DoneCallback, Job } from 'bull';
import * as AdmZip from 'adm-zip';
import imagemin from 'imagemin';
import imageminPng from 'imagemin-pngquant';

export async function imageProcessor(job: Job, doneCallback: DoneCallback) {
  const files: Express.Multer.File[] = job.data.files;

  const optimizationPromises: Promise<Buffer>[] = files.map((file) => {
    const fileBuffer = Buffer.from(file.buffer);

    return imagemin.buffer(fileBuffer, {
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

  doneCallback(null, zip.toBuffer());
}
