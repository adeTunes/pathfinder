import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { getRoomKey } from 'src/helpers/get-room-key';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Map to store connected clients grouped by friendId
  private rooms: Map<string, WebSocket[]> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private config: ConfigService,
  ) {}

  handleConnection(client: WebSocket, request: any) {
    const { token, friendId } = this.parseUrlParams(request.url);

    // Get userId from token (you need to implement this)
    const userId = this.getUserIdFromToken(token);

    if (!userId) {
      client.send('Unauthorized. Invalid token.');
      client.close();
      return;
    }

    // If friendId is not provided, inform the client and close the connection
    if (!friendId) {
      client.send('Please provide friendId in the connection URL.');
      client.close();
      return;
    }

    // Determine the room key based on the two user IDs
    const roomKey = getRoomKey({ userId, friendId });

    // Get or create room based on the room key
    let room = this.rooms.get(roomKey);
    if (!room) {
      room = [];
      this.rooms.set(roomKey, room);
    }

    // Add client to the room
    room.push(client);
  }

  handleDisconnect(client: WebSocket) {
    console.log('client disconnected');
    // Find and remove the client from the room
    this.rooms.forEach((roomClients, friendId) => {
      const index = roomClients.indexOf(client);
      if (index !== -1) {
        roomClients.splice(index, 1);
        // If the room becomes empty, delete it
        if (roomClients.length === 0) {
          this.rooms.delete(friendId);
        }
        return;
      }
    });
  }

  @SubscribeMessage('message')
  async handleMessage(client: WebSocket, message: string) {
    // Broadcast the received message to the other connected client in the same room
    const room = this.findRoomByClient(client);
    if (room) {
      room.forEach(async (roomClient) => {
        // if (roomClient !== client) {
        // }
        roomClient.send(`User: ${message}`);
      });

      //   // Persist the message to the database
      //   const { roomKey } = this.findRoomIdByClient(client);
      //   await this.messageService.createMessage({
      //     roomId: roomKey,
      //     content: message,
      //   });
    }
  }

  private parseUrlParams(url: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const queryString = url.split('?')[1];
    if (queryString) {
      const keyValuePairs = queryString.split('&');
      keyValuePairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        params[key] = value;
      });
    }
    return params;
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      // Verify the token and decode it
      const decodedToken: any = jwt.verify(
        token,
        this.config.get('JWT_SECRET'),
      );
      // Extract the user ID from the decoded token
      const userId: string = decodedToken.sub;

      return userId;
    } catch (error) {
      // Check if the error is due to token expiration
      if (error instanceof TokenExpiredError) {
        console.error('Token has expired');
      } else {
        console.error('Invalid token');
      }
      return null;
    }
  }

  private findRoomByClient(client: WebSocket): WebSocket[] | undefined {
    // Find the room containing the given client
    let room: WebSocket[] | undefined;
    this.rooms.forEach((roomClients) => {
      if (roomClients.includes(client)) {
        room = roomClients;
        return;
      }
    });
    return room;
  }

  private findRoomIdByClient(
    client: WebSocket,
  ): { roomKey: string } | undefined {
    // Find the room containing the given client and return the roomId
    let roomId: { roomKey: string } | undefined;
    this.rooms.forEach((roomClients, roomKey) => {
      if (roomClients.includes(client)) {
        roomId = { roomKey };
        return;
      }
    });
    return roomId;
  }
}
