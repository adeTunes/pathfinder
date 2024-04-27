import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class UploadCourseDto {
  @IsNumberString()
  @IsNotEmpty()
  id: number;
}
