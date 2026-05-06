import { Controller, Get, Param } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('hourly')
  async getHourlyPricing() {
    return this.pricingService.getAllHourlyPricing();
  }

  @Get('airport')
  async getAirportPricing() {
    return this.pricingService.getAllAirportPricing();
  }

  @Get('airport/:code')
  async getAirportPricingByCode(@Param('code') code: string) {
    return this.pricingService.getAirportPricingByCode(code);
  }

  @Get('intercity')
  async getIntercityPricing() {
    return this.pricingService.getAllIntercityPricing();
  }

  @Get('seed')
  async seedPricing() {
    await this.pricingService.seedInitialPricing();
    return { message: 'Pricing data seeded successfully' };
  }
}
