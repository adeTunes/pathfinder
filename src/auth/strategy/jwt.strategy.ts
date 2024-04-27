import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        profilePicture: true,
        biodata: {
          select: {
            name: true,
            gender: true,
            institution: true,
            availability: {
              select: {
                dayAvailable: true,
                timeAvailable: true,
              },
            },
          },
        },
        isVerified: true,
        mentee: {
          select: {
            status: true,
            mentor: {
              select: {
                id: true,
                email: true,
                biodata: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        mentor: {
          select: {
            status: true,
            mentee: {
              select: {
                id: true,
                email: true,
                biodata: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        role: true,
      },
    });
    const {
      mentee,
      mentor,
      biodata: { availability, ...remaining },
      ...rest
    } = user;
    let response = { ...rest, ...remaining, availability };
    if (response.role === 'MENTEE') {
      return {
        ...response,
        mentors: mentee.map((item) => {
          return {
            id: item.mentor.id,
            status: item.status,
            email: item.mentor.email,
            name: item.mentor.biodata?.name,
          };
        }),
      };
    } else {
      return {
        ...response,
        mentees: mentor.map((item) => {
          return {
            id: item.mentee.id,
            status: item.status,
            email: item.mentee.email,
            name: item.mentee.biodata?.name,
          };
        }),
      };
    }
  }
}
