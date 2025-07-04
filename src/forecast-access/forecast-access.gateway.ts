import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForecastAccessService } from './forecast-access.service';
import { HttpStatus, Inject, Logger, UseGuards } from '@nestjs/common';
import { AuthGuardSocket } from 'src/auth/guards/auth.socket.guard';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';
import { User } from 'src/auth/decorators/user.socket.decorator';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@WebSocketGateway({ cors: true })
export class ForecastAccessGateway {
  @WebSocketServer()
  server: Server;

  private subscribedClients = new Set<Socket>();
  private readonly logger = new Logger('Client gateway service');

  constructor(
    private readonly service: ForecastAccessService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @UseGuards(AuthGuardSocket)
  @SubscribeMessage('subscribe')
  async handleForecastSubscription(
    @ConnectedSocket() client: Socket,
    @User() user: CurrentUser,
  ) {
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
    this.logger.log(
      `Forecast sent to client ${user.email}, with socket id ${client.id}`,
    );

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
    this.logger.log(
      `Forecast broadcasted to ${this.subscribedClients.size} clients`,
    );

    for (const client of this.subscribedClients) {
      client.emit('forecast', forecast);
    }
  }
}
