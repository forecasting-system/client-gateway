import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastAccessService {
  getForecast() {
    return 'Forecast example';
  }
}
