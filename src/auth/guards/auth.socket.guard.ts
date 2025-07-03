import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthGuardSocket implements CanActivate {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromSocket(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }
    try {
      const { user, token: newToken } = await firstValueFrom(
        this.client.send('auth.verify.user', token),
      );

      client.data = {
        ...client.data,
        user,
        token: newToken,
      };
    } catch {
      throw new WsException('Unauthorized');
    }
    return true;
  }

  private extractTokenFromSocket(client: any): string | undefined {
    const authHeader = client.handshake?.headers?.authorization;
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
