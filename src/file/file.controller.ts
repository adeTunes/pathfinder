import {
  Body,
  Controller,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileService } from './file.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Request } from 'express';
import { ApiFile } from './decorators/api-file.decorator';
import { ParseFile } from './validation/file-size-validation';
import { getFileUrl } from 'src/helpers/get-file-url';
import { UploadCourseDto } from './dto/upload-course.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Patch('upload-profile-picture')
  @ApiFile()
  uploadProfilePicture(
    @UploadedFile(ParseFile) file: Express.Multer.File,
    @Req() req: Request,
    @GetUser('id') userId: number,
  ) {
    return this.fileService.uploadProfilePicture(file?.path, userId);
  }

  @Patch('upload-cover-photo')
  @ApiFile('cover_photo')
  uploadArticleCover(
    @UploadedFile(ParseFile) file: Express.Multer.File,
    @Req() req: Request,
    @Body() uploadCourseDto: UploadCourseDto,
    @GetUser('id') userId: number,
  ) {
    return this.fileService.uploadCoverPhoto(
      file?.path,
      +uploadCourseDto.id,
      userId,
    );
  }
}
