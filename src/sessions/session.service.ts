import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSessionDto } from './dto/request-session.dto';
// import dayjs from 'dayjs';
// import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import {
  Availability,
  DaysType,
  Role,
  SessionRequestStatus,
} from '@prisma/client';
import { api_response } from 'src/helpers/api.response';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AcceptRejectDto } from './dto/accept-reject.dto';
import { MentorshipRequestAction } from 'src/mentor/dto/accept-reject.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async getAllSessionRequests(userId: number, role: Role) {
    const sessionRequests = await this.prisma.sessionRequests.findMany({
      where: {
        ...(role === Role.MENTEE ? { menteeId: userId } : { mentorId: userId }),
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        timeScheduled: true,
        dateScheduled: true,
        duration: true,
        expectations: true,
        questions: true,
        message: true,
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
    });

    return sessionRequests.map(
      ({
        mentor: {
          id,
          email: mentorEmail,
          biodata: { name },
        },
        mentee: {
          id: menteeId,
          email,
          biodata: { name: menteeName },
        },
        ...rest
      }) => ({
        ...rest,
        ...(role === Role.MENTEE
          ? { mentor: { id, name, email: mentorEmail } }
          : { mentee: { id: menteeId, name: menteeName, email } }),
      }),
    );
  }

  async requestSession(requestSessionDto: RequestSessionDto, userId: number) {
    const dayjs = require('dayjs');
    const LocalizedFormat = require('dayjs/plugin/localizedFormat');
    dayjs.extend(LocalizedFormat);
    const day = dayjs(requestSessionDto.dateScheduled)
      .format('dddd')
      .toUpperCase() as DaysType;
    const requestMonth = dayjs(requestSessionDto.dateScheduled).format('MMMM');
    const availableMentor = await this.prisma.availability.findFirst({
      where: {
        mentorId: requestSessionDto.mentorId,
        dayAvailable: day,
      },
    });
    if (!availableMentor)
      throw new BadRequestException('Mentor is not free on this day');
    if (requestSessionDto.duration > availableMentor.timeAvailable)
      throw new BadRequestException(
        `You can only schedule for ${availableMentor.timeAvailable} minutes on this day`,
      );

    const lastScheduledMonth = dayjs(availableMentor.lastDateScheduled).format(
      'MMMM',
    );
    if (requestMonth === lastScheduledMonth) {
      if (
        availableMentor.timeRemainingForSchedule < requestSessionDto.duration
      ) {
        if (availableMentor.timeRemainingForSchedule) {
          throw new BadRequestException(
            `Mentor is  only free for ${availableMentor.timeRemainingForSchedule} minutes on this day`,
          );
        } else {
          throw new BadRequestException(
            `Mentor is  completely booked on this day`,
          );
        }
      } else {
        return this.performRequest(requestSessionDto, userId);
      }
    } else return this.performRequest(requestSessionDto, userId);
  }

  async acceptRejectSession(acceptRejectDto: AcceptRejectDto) {
    if (acceptRejectDto.action === MentorshipRequestAction.ACCEPT) {
      
      if (acceptRejectDto.approveUnavailableDay) {
        await this.prisma.sessionRequests.update({
          where: {
            id: acceptRejectDto.sessionId,
          },
          data: { status: SessionRequestStatus.ACCEPTED },
        });
        return api_response({
          status: 200,
          message: 'Session accepted successfully',
        });
      }
      const sessionRequest = await this.prisma.sessionRequests.findUnique({
        where: {
          id: acceptRejectDto.sessionId,
        },
      });
      const dayjs = require('dayjs');
      const LocalizedFormat = require('dayjs/plugin/localizedFormat');
      dayjs.extend(LocalizedFormat);
      const day = dayjs(sessionRequest.dateScheduled)
        .format('dddd')
        .toUpperCase() as DaysType;
      const requestMonth = dayjs(sessionRequest.dateScheduled).format('MMMM');
      const availableMentor = await this.prisma.availability.findFirst({
        where: {
          dayAvailable: day,
          mentorId: sessionRequest.mentorId,
        },
      });

      if (!availableMentor)
        throw new NotFoundException(
          'This session was scheduled on a day you are no longer available, would you still like to accept the request?',
        );
      const lastScheduledMonth = dayjs(
        availableMentor.lastDateScheduled,
      ).format('MMMM');
      const isNewMonth = requestMonth !== lastScheduledMonth;
      await this.prisma.availability.update({
        where: {
          id: availableMentor.id,
        },
        data: {
          lastDateScheduled: sessionRequest.dateScheduled,
          timeRemainingForSchedule: isNewMonth
            ? availableMentor.timeAvailable - sessionRequest.duration
            : availableMentor.timeRemainingForSchedule -
              sessionRequest.duration,
        },
      });
      await this.prisma.sessionRequests.update({
        where: {
          id: acceptRejectDto.sessionId,
        },
        data: { status: SessionRequestStatus.ACCEPTED },
      });
      return api_response({
        status: 200,
        message: 'Session accepted successfully',
      });
    } else {
      await this.prisma.sessionRequests.update({
        where: {
          id: acceptRejectDto.sessionId,
        },
        data: { status: SessionRequestStatus.DECLINED },
      });
      return api_response({
        status: 200,
        message: 'Session rejected successfully',
      });
    }
  }

  async performRequest(requestSessionDto: RequestSessionDto, userId: number) {
    try {
      await this.prisma.sessionRequests.create({
        data: {
          ...requestSessionDto,
          menteeId: userId,
          mentorId: requestSessionDto.mentorId,
        },
      });

      return api_response({
        status: 200,
        message: 'Session scheduled successfully',
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException(
            'You can not request another session from this mentor',
          );
        }
      }
      throw e;
    }
  }
}
