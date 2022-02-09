import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  title: string;

  @IsString({ each: true })
  paragraphs: string[];

  @IsString({ each: true })
  categories: string[];
}
