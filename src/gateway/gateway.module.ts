import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway.service';
import { ChatService } from 'src/chat/chat.service';

@Module({
  providers: [ChatGateway, ChatService],
})
export class GatewayModule {}
