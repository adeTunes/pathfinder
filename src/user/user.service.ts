import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async updateProfile(updateUserDto: UpdateUserDto, user: User) {
    const { id, email } = user;
    const { availability, ...rest } = updateUserDto;

    const biodata = await this.prisma.biodata.update({
      where: {
        userId: id,
      },
      data: rest,
      select: {
        name: true,
        gender: true,
        user: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });

    if (user.role === Role.MENTOR) {
      const insertValues = availability.map(
        ({ dayAvailable, timeAvailable }) => ({
          dayAvailable,
          mentorId: user.id,
          timeAvailable,
          timeRemainingForSchedule: timeAvailable,
        }),
      );

      // Delete all existing entries for the mentorId
      await this.prisma.availability.deleteMany({
        where: {
          mentorId: user.id,
        },
      });

      // Create new entries
      const insertPromises = insertValues.map((value) =>
        this.prisma.availability.create({ data: value }),
      );

      await this.prisma.$transaction(insertPromises);
    }

    const response = {
      name: biodata.name,
      gender: biodata.gender,
      ...biodata.user,
    };
    if (user.isVerified) return response;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto, userId: number) {
    const unverifiedUser = await this.prisma.unverifiedUser.findUnique({
      where: {
        userId,
      },
    });
    if (!unverifiedUser) throw new ForbiddenException('Invalid Request');
    if (unverifiedUser.token !== verifyCodeDto.otp)
      throw new BadRequestException('Invalid Token');
    await this.prisma.unverifiedUser.delete({
      where: { id: unverifiedUser.id },
    });
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { isVerified: true },
    });
    delete user.hash;
    return user;
  }

  
}
