import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ForecastAccessModule } from './forecast-access/forecast-access.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [AuthModule, ForecastAccessModule, NatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
