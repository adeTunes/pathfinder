import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  getMessagesWithFriend(
    @Query('friend', ParseIntPipe) friendId: number,
    @GetUser('id') userId: number,
  ) {
    return this.chatService.getMessagesWithFriend(userId, friendId);
  }
}
