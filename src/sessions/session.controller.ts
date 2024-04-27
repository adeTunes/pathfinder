import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { RequestSessionDto } from './dto/request-session.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Role, User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AcceptRejectDto } from './dto/accept-reject.dto';

@UseGuards(JwtGuard)
@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post('requests')
  requestSession(
    @Body() requestSessionDto: RequestSessionDto,
    @GetUser() user: User,
  ) {
    if (user.role !== Role.MENTEE)
      throw new ForbiddenException('Invalid Request');
    return this.sessionService.requestSession(requestSessionDto, user.id);
  }
  @Patch('requests/accept-reject')
  acceptRejectSession(
    @Body() acceptRejectDto: AcceptRejectDto,
    @GetUser() user: User,
  ) {
    if (user.role === Role.MENTEE)
      throw new ForbiddenException('Invalid Request');
    return this.sessionService.acceptRejectSession(acceptRejectDto);
  }

  @Get('requests')
  getAllSessionRequests(
    @GetUser('id') userId: number,
    @GetUser('role') role: Role,
  ) {
    return this.sessionService.getAllSessionRequests(userId, role);
  }
}
