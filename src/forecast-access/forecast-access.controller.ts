import { Controller, Logger } from '@nestjs/common';
import { ForecastAccessGateway } from './forecast-access.gateway';
import { EventPattern } from '@nestjs/microservices';

@Controller('forecast')
export class ForecastAccessController {
  constructor(private readonly gateway: ForecastAccessGateway) {}

  private readonly logger = new Logger('Client gateway service');

  @EventPattern('internal.forecast.updated')
  handleForecastUpdate() {
    this.logger.log(`Forecast update received`);
    return this.gateway.broadcastForecastUpdate();
  }
}
