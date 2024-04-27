import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dto/signin.dto';
import { randomInt } from 'crypto';
import { response } from 'express';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      // hash pawssord
      const hash = await argon.hash(createUserDto.password);

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          hash,
          role: createUserDto.role,
          biodata: {
            create: {},
          },
          unverifiedUser: {
            create: {
              email: createUserDto.email,
              token: this.generateRandomCode(),
            },
          },
        },
        include: {
          biodata: true,
          unverifiedUser: true,
        },
      });

      try {
        await this.sendEmail(
          user.unverifiedUser.email,
          user.unverifiedUser.token,
        );
        return this.signToken(user.id, user.email);
      } catch (error) {
        throw new BadRequestException(
          'Something went wrong!!, could not sign up',
        );
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code) {
          throw new ForbiddenException('Credentials taken');
        }
      } else throw error;
    }
  }

  async signin(signDto: SigninDto) {
    // find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: signDto.email,
      },
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    // compare password
    const isPasswordValid = await argon.verify(user.hash, signDto.password);

    if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');

    // sign token
    const access_token = await this.signToken(user.id, user.email);
    return { ...access_token, isVerified: user.isVerified };
  }

  async signToken(
    id: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: id,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: '24h',
    });

    return { access_token: token };
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
