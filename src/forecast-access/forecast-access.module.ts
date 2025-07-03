import { Module } from '@nestjs/common';
import { ForecastAccessService } from './forecast-access.service';
import { ForecastAccessController } from './forecast-access.controller';
import { ForecastAccessGateway } from './forecast-access.gateway';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ForecastAccessController],
  providers: [ForecastAccessService, ForecastAccessGateway],
  imports: [NatsModule],
})
export class ForecastAccessModule {}
