import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { HourlyPricing } from '../entities/hourly-pricing.entity';
import { AirportPricing } from '../entities/airport-pricing.entity';
import { IntercityPricing } from '../entities/intercity-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HourlyPricing,
      AirportPricing,
      IntercityPricing,
    ]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
