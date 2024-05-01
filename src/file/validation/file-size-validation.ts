import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseFile implements PipeTransform {
  transform(
    file: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Express.Multer.File | Express.Multer.File[] {
    if (file === undefined || file === null) {
      console.log({file})
      throw new BadRequestException('Validation failed (file expected)');
    }

    return file;
  }
}
