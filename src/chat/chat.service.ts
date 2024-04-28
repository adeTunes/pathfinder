import { Injectable } from '@nestjs/common';
import { getRoomKey } from 'src/helpers/get-room-key';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: number, roomKey: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        body: content,
        senderId,
        roomKey,
      },
    });

    return message;
  }

  async getMessagesWithFriend(userId: number, friendId: number) {
    const roomKey = getRoomKey({ userId, friendId });
    const messages = await this.prisma.message.findMany({
      where: {
        roomKey,
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            profilePicture: true,
            biodata: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return messages.map(
      ({
        sender: {
          id,
          profilePicture,
          biodata: { name },
        },
        ...rest
      }) => ({
        ...rest,
        sender: {
          id,
          profilePicture,
          name,
        },
      }),
    );
  }
}
