import { Module } from '@nestjs/common';
import { ForecastAccessService } from './forecast-access.service';
import { ForecastAccessController } from './forecast-access.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ForecastAccessController],
  providers: [ForecastAccessService],
  imports: [NatsModule],
})
export class ForecastAccessModule {}
