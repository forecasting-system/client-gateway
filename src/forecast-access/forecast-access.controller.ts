import { Controller } from '@nestjs/common';
import { ForecastAccessService } from './forecast-access.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('forecast')
export class ForecastAccessController {
  constructor(private readonly forecastAccessService: ForecastAccessService) {}

  @EventPattern('internal.forecast.updated')
  // TODO: data DTO
  handleForecastUpdate(@Payload() data: any): void {
    console.log(`Forecast received ${data}`);
    return this.forecastAccessService.updateForecast(data);
  }
}
