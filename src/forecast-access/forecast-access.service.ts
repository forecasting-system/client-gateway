import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastAccessService {
  updateForecast(data: any) {
    console.log(`Forecast received`);
  }
}
