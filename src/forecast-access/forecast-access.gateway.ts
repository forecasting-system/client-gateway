import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForecastAccessService } from './forecast-access.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuardSocket } from 'src/auth/guards/auth.socket.guard';

@WebSocketGateway({ cors: true })
export class ForecastAccessGateway {
  @WebSocketServer()
  server: Server;

  private subscribedClients = new Set<Socket>();

  constructor(private readonly service: ForecastAccessService) {}

  @UseGuards(AuthGuardSocket)
  @SubscribeMessage('subscribe')
  async handleForecastSubscription(@ConnectedSocket() client: Socket) {
    this.subscribedClients.add(client);

    const forecast = this.service.getForecast();
    client.emit('forecast', forecast);

    client.on('disconnect', () => {
      this.subscribedClients.delete(client);
    });
  }

  async broadcastForecastUpdate() {
    const forecast = this.service.getForecast();
    for (const client of this.subscribedClients) {
      client.emit('forecast', forecast);
    }
  }
}
