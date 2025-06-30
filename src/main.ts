import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { envs } from './config';
import { RcpCustomExceptionFilter } from './common/rpc-custom-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Client Gateway MS Main');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RcpCustomExceptionFilter());

  await app.listen(envs.port);

  logger.log(`Client Gateway listening on port ${envs.port}`);
}
bootstrap();
