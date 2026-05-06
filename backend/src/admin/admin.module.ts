import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Booking } from '../entities/booking.entity';
import { Route } from '../entities/route.entity';
import { HourlyPricing } from '../entities/hourly-pricing.entity';
import { AirportPricing } from '../entities/airport-pricing.entity';
import { IntercityPricing } from '../entities/intercity-pricing.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Route,
      HourlyPricing,
      AirportPricing,
      IntercityPricing,
      AdminUser, // ДОБАВЛЕНО - для JWT Strategy
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
