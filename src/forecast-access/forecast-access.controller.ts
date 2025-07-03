import { Controller } from '@nestjs/common';
import { ForecastAccessGateway } from './forecast-access.gateway';
import { EventPattern } from '@nestjs/microservices';

@Controller('forecast')
export class ForecastAccessController {
  constructor(private readonly gateway: ForecastAccessGateway) {}

  @EventPattern('internal.forecast.updated')
  handleForecastUpdate() {
    console.log(`Forecast received`);
    return this.gateway.broadcastForecastUpdate();
  }
}
