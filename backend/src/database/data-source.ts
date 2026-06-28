import * as path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getPostgresConnectionOptions } from './database.config';
import { Booking } from '../entities/booking.entity';
import { Route } from '../entities/route.entity';
import { HourlyPricing } from '../entities/hourly-pricing.entity';
import { AirportPricing } from '../entities/airport-pricing.entity';
import { IntercityPricing } from '../entities/intercity-pricing.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { Contact } from '../entities/contact.entity';
import { RouteBooking, AirportBooking, HourlyBooking } from '../entities/specialized-bookings.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { InterCityDestination } from '../entities/intercity-destination.entity';

const conn = getPostgresConnectionOptions();

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...conn,
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
    Vehicle,
    InterCityDestination,
  ],
  migrations: [path.join(__dirname, '..', 'migrations', '*.js')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});
