import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function ApiFile(fieldName: string = 'profile_picture') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: './uploads',
          filename(req, file, callback) {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() + 1e9);
            const ext = extname(file.originalname);
            const fileName = `${file.originalname.replace(ext, '').replaceAll(' ', '_')}-${uniqueSuffix}-${ext}`;

            callback(null, fileName);
          },
        }),
        limits: {
          fileSize: 1024 * 1024 * 1,
        },
        fileFilter: (req, file, callback) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(
              new BadRequestException('Only image files are allowed!'),
              false,
            );
          }
          callback(null, true);
        },
      }),
    ),
  );
}
