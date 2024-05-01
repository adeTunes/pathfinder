import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { api_response } from 'src/helpers/api.response';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadProfilePicture(filePath: string, userId: number) {
    const fileResponse = await this.cloudinaryService.upLoadFile(filePath);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { profilePicture: fileResponse.secure_url },
    });

    return api_response({
      status: 200,
      message: 'Profile picture uploaded',
    });
  }

  async uploadCoverPhoto(filePath: string, id: number, userId: number) {
    try {
      const fileResponse = await this.cloudinaryService.upLoadFile(filePath);
      await this.prisma.resources.update({
        where: {
          id,
          userId,
        },
        data: { coverPhoto: fileResponse.secure_url },
      });
      return api_response({
        status: 200,
        message: 'Cover photo uploaded',
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Resource not found');
        }
      } else throw error;
    }
  }
}
