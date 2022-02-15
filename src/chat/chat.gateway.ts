import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthenticationGuard)
  @SubscribeMessage('send_message')
  async listenToMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() content: string,
  ) {
    const author = socket.data.user;
    const message = await this.chatService.saveMessage(content, author);

    this.server.sockets.emit('receive_message', message);
  }

  @UseGuards(JwtAuthenticationGuard)
  @SubscribeMessage('request_all_messages')
  async requestAllMessages(@ConnectedSocket() socket: Socket) {
    const messages = await this.chatService.getAllMessages();

    socket.emit('send_all_messages', messages);
  }
}
