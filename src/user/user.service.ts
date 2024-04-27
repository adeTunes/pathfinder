import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
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
    try {
      const verificationCode = this.generateRandomCode();
      await this.prisma.unverifiedUser.update({
        where: {
          userId: id,
        },
        data: { token: verificationCode },
      });
      await this.sendEmail(email, verificationCode);

      return response;
    } catch (error) {
      console.log(error);
    }
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

  async sendEmail(email: string, code: number) {
    var transport = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: this.config.get('MAIL_PORT'),
      secure: this.config.get('MAIL_SECURE'),
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    });

    const options: Mail.Options = {
      from: {
        name: this.config.get('APP_NAME'),
        address: this.config.get('DEFAULT_MAIL_FROM'),
      },
      to: email,
      subject: 'Verfication Code',
      html: `<p>Your verification code <strong>${code}</strong>`,
    };

    try {
      const result = await transport.sendMail(options);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  generateRandomCode(): number {
    // Generate a random 4-digit number
    return randomInt(1000, 9999);
  }
}
