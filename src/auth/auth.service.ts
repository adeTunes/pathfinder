import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dto/signin.dto';

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
        data: { email: createUserDto.email, hash, role: createUserDto.role },
      });
      await this.prisma.biodata.create({
        data: { userId: user.id },
      });
      await this.prisma.unverifiedUser.create({
        data: { email: createUserDto.email, userId: user?.id },
      });
      return this.signToken(user.id, user.email);
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
}
