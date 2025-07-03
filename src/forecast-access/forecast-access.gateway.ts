import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForecastAccessService } from './forecast-access.service';
import { HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { AuthGuardSocket } from 'src/auth/guards/auth.socket.guard';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@WebSocketGateway({ cors: true })
export class ForecastAccessGateway {
  @WebSocketServer()
  server: Server;

  private subscribedClients = new Set<Socket>();

  constructor(
    private readonly service: ForecastAccessService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @UseGuards(AuthGuardSocket)
  @SubscribeMessage('subscribe')
  async handleForecastSubscription(@ConnectedSocket() client: Socket) {
    this.subscribedClients.add(client);

    const forecast = await firstValueFrom(
      this.client.send('getForecast', {}).pipe(
        catchError((err) => {
          throw new RpcException({
            message: err.message,
            status: HttpStatus.BAD_REQUEST,
          });
        }),
      ),
    );

    client.emit('forecast', forecast);

    client.on('disconnect', () => {
      this.subscribedClients.delete(client);
    });
  }

  async broadcastForecastUpdate() {
    const forecast = await firstValueFrom(
      this.client.send('getForecast', {}).pipe(
        catchError((err) => {
          throw new RpcException({
            message: err.message,
            status: HttpStatus.BAD_REQUEST,
          });
        }),
      ),
    );
    console.log('forecast', forecast);
    for (const client of this.subscribedClients) {
      client.emit('forecast', forecast);
    }
  }
}
