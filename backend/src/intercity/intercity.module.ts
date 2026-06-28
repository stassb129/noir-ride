import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterCityDestination } from '../entities/intercity-destination.entity';
import { InterCityService } from './intercity.service';
import { InterCityController } from './intercity.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([InterCityDestination]), AuthModule],
  controllers: [InterCityController],
  providers: [InterCityService],
  exports: [InterCityService],
})
export class InterCityModule {}
