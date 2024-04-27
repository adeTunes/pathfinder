import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { api_response } from 'src/helpers/api.response';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async uploadProfilePicture(fileUrl: string, userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { profilePicture: fileUrl },
    });

    return api_response({
      status: 201,
      message: 'Profile picture uploaded',
    });
  }
  async uploadCoverPhoto(fileUrl: string, id: number, userId: number) {
    try {
      await this.prisma.resources.update({
        where: {
          id,
          userId,
        },
        data: { coverPhoto: fileUrl },
      });
      return api_response({
        status: 201,
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
