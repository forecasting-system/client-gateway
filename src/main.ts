import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { envs } from './config';
import { RcpCustomExceptionFilter } from './common/rpc-custom-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Client Gateway MS Main');

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers,
    },
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RcpCustomExceptionFilter());

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Client Gateway listening on port ${envs.port}`);
}
bootstrap();
