import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Relation,
  RequestStatus,
  ResourceType,
  Role,
  User,
} from '@prisma/client';
import { api_response } from 'src/helpers/api.response';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AcceptRejectDto,
  MentorshipRequestAction,
} from './dto/accept-reject.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MentorService {
  constructor(private prisma: PrismaService) {}
  async getAllMentors(userId?: number) {
    const mentors = await this.prisma.user.findMany({
      where: { role: Role.MENTOR, isVerified: true },
      select: {
        id: true,
        email: true,
        role: true,
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
        biodata: {
          select: {
            name: true,
            industry: true,
          },
        },
      },
    });
    return mentors.map(({ id, email, mentor, biodata }) => {
      return {
        id,
        email,
        ...(userId && {
          status:
            mentor.find((el) => el.mentee.id === userId)?.status ??
            RequestStatus.NOT_ACTIVE,
        }),
        ...biodata,
      };
    });
  }

  async getSingleMentor(mentorId: number, userId?: number) {
    try {
      const mentor = await this.prisma.user.findUnique({
        where: { id: mentorId, role: Role.MENTOR, isVerified: true },
        select: {
          id: true,
          email: true,
          role: true,
          availability: true,
          resources: true,
          profilePicture: true,
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
          biodata: {
            select: {
              name: true,
              industry: true,
              bio: true,
              headline: true,
            },
          },
        },
      });

      return {
        id: mentor.id,
        availability: mentor.availability,
        email: mentor.email,
        name: mentor.biodata?.name,
        profilePicture: mentor.profilePicture,
        industry: mentor.biodata.industry,
        bio: mentor.biodata.bio,
        headline: mentor.biodata.headline,
        resources: mentor.resources.map((item) => {
          const {
            content,
            description,
            studentsEnrolled,
            studentGraduated,
            price,
            lessons,
            level,
            hasCertifications,
          } = item;
          if (item.type === ResourceType.article) return { ...item, content };
          else
            return {
              ...item,
              description,
              studentsEnrolled,
              studentGraduated,
              price,
              lessons,
              level,
              hasCertifications,
            };
        }),
        ...(userId && {
          status:
            mentor.mentor.find((el) => el.mentee.id === userId)?.status ??
            RequestStatus.NOT_ACTIVE,
        }),
      };
    } catch (error) {
      throw new NotFoundException('Mentor not found');
    }
  }

  async requestMentorship(userId: number, mentorId: number) {
    await this.prisma.relation.create({
      data: { menteeId: userId, mentorId: mentorId },
    });

    return api_response({
      status: HttpStatus.CREATED,
      message: 'Data Saved',
    });
  }

  async pendingMentorshipRequest(user: User) {
    const requests = await this.prisma.relation.findMany({
      where: {
        ...(user.role === Role.MENTOR
          ? { mentorId: user.id }
          : { menteeId: user.id }),
        status: RequestStatus.PENDING_REQUEST,
      },
      select: {
        id: true,
        mentee: {
          select: {
            id: true,
            email: true,
            biodata: {
              select: {
                name: true,
                location: true,
                gender: true,
              },
            },
          },
        },
        mentor: {
          select: {
            id: true,
            email: true,
            biodata: {
              select: {
                name: true,
                location: true,
                gender: true,
              },
            },
          },
        },
      },
    });

    return requests.map(
      ({
        id,
        mentee: {
          id: menteeId,
          email,
          biodata: { name, location, gender },
        },
        mentor: {
          id: mentorId,
          email: mentorEmail,
          biodata: {
            name: mentorName,
            location: mentorLocation,
            gender: mentorGender,
          },
        },
      }) => ({
        id,
        ...(user.role === Role.MENTOR
          ? { menteeId, email, name, location, gender }
          : {
              mentorId,
              email: mentorEmail,
              name: mentorName,
              location: mentorLocation,
              gender: mentorGender,
            }),
      }),
    );
  }

  async acceptRejectMentorshipRequest(
    user: User,
    acceptRejectDto: AcceptRejectDto,
  ) {
    if (user.role !== Role.MENTOR)
      throw new ForbiddenException('Invalid Request');

    await this.prisma.relation.update({
      where: {
        id: acceptRejectDto.requestId,
        mentorId: user.id,
        status: RequestStatus.PENDING_REQUEST,
      },
      data: {
        status:
          acceptRejectDto.action === MentorshipRequestAction.ACCEPT
            ? RequestStatus.MENTOR_ACCEPTED
            : RequestStatus.NOT_ACTIVE,
      },
    });

    return api_response({ status: 200, message: 'Request successful' });
  }

  async scheduleSession() {}
}
