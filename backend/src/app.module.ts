import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Booking } from './entities/booking.entity';
import { Route } from './entities/route.entity';
import { HourlyPricing } from './entities/hourly-pricing.entity';
import { AirportPricing } from './entities/airport-pricing.entity';
import { IntercityPricing } from './entities/intercity-pricing.entity';
import { AdminUser } from './entities/admin-user.entity';
import { Contact } from './entities/contact.entity';
import { RouteBooking, AirportBooking, HourlyBooking } from './entities/specialized-bookings.entity';

// Modules
import { PricingModule } from './pricing/pricing.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // TypeORM configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'noir_admin',
      password: process.env.DB_PASSWORD || 'noir_password_2026',
      database: process.env.DB_DATABASE || 'noir_ride',
      entities: [
        Booking,
        Route,
        HourlyPricing,
        AirportPricing,
        IntercityPricing,
        AdminUser,
        Contact,
        RouteBooking,
        AirportBooking,
        HourlyBooking,
      ],
      // Dev: auto-create/update tables. Prod (e.g. Render): off unless DB_SYNC=true for first-time schema.
      synchronize:
        process.env.NODE_ENV === 'development' ||
        process.env.DB_SYNC === 'true',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    }),
    PricingModule,
    BookingModule,
    AuthModule,
    AdminModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
