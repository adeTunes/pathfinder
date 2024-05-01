import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { User } from '@prisma/client';
import {
  AcceptRejectDto,
  CancelRequestDto,
  MentorshipRequestAction,
} from './dto/accept-reject.dto';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Get()
  getAllMentors() {
    return this.mentorService.getAllMentors();
  }

  @UseGuards(JwtGuard)
  @Get('auth')
  getAllMentorsAuthenticated(@GetUser('id') userId: number) {
    return this.mentorService.getAllMentors(userId);
  }

  @UseGuards(JwtGuard)
  @Get('mentorship-requests')
  pendingMentorshipRequest(@GetUser() user: User) {
    return this.mentorService.pendingMentorshipRequest(user);
  }

  @Get(':id')
  getSingleMentor(@Param('id', ParseIntPipe) mentorId: number) {
    return this.mentorService.getSingleMentor(mentorId);
  }

  @UseGuards(JwtGuard)
  @Post('mentorship-requests/accept-reject')
  acceptRejectMentorshipRequest(
    @GetUser() user: User,
    @Body() acceptRejectDto: AcceptRejectDto,
  ) {
    return this.mentorService.acceptRejectMentorshipRequest(
      user,
      acceptRejectDto,
    );
  }

  @UseGuards(JwtGuard)
  @Patch('mentorship-requests/cancel')
  cancelMentorshipRequest(@Body() cancelRequestDto: CancelRequestDto) {
    return this.mentorService.cancelMentorshipRequest(
      cancelRequestDto.requestId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('auth/:id')
  getSingleMentorAuthenticated(
    @Param('id', ParseIntPipe) mentorId: number,
    @GetUser('id') userId: number,
  ) {
    return this.mentorService.getSingleMentor(mentorId, userId);
  }

  @UseGuards(JwtGuard)
  @Post('request/:id')
  requestMentorship(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) mentorId: number,
  ) {
    return this.mentorService.requestMentorship(userId, mentorId);
  }

  // @UseGuards(JwtGuard)
  // @Post('mentorship/:id')
  // acceptRejectMentorship(
  //   @GetUser() user: User,
  //   @Param('id', ParseIntPipe) requestId: number,
  // ) {
  //   return this.mentorService.requestMentorship(user, requestId);
  // }
}
