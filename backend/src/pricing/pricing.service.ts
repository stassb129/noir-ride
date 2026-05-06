import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HourlyPricing } from '../entities/hourly-pricing.entity';
import { AirportPricing } from '../entities/airport-pricing.entity';
import { IntercityPricing } from '../entities/intercity-pricing.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(HourlyPricing)
    private hourlyRepo: Repository<HourlyPricing>,
    
    @InjectRepository(AirportPricing)
    private airportRepo: Repository<AirportPricing>,
    
    @InjectRepository(IntercityPricing)
    private intercityRepo: Repository<IntercityPricing>,
  ) {}

  // Hourly Pricing
  async getAllHourlyPricing() {
    return this.hourlyRepo.find({ where: { isActive: true } });
  }

  // Airport Pricing
  async getAllAirportPricing() {
    return this.airportRepo.find({ where: { isActive: true } });
  }

  async getAirportPricingByCode(airportCode: string) {
    return this.airportRepo.find({
      where: { airportCode: airportCode as any, isActive: true },
    });
  }

  // Intercity Pricing
  async getAllIntercityPricing() {
    return this.intercityRepo.find({ where: { isActive: true } });
  }

  // Seed initial data (for first run)
  async seedInitialPricing() {
    const hourlyCount = await this.hourlyRepo.count();
    if (hourlyCount === 0) {
      await this.seedHourlyPricing();
    }

    const airportCount = await this.airportRepo.count();
    if (airportCount === 0) {
      await this.seedAirportPricing();
    }

    const intercityCount = await this.intercityRepo.count();
    if (intercityCount === 0) {
      await this.seedIntercityPricing();
    }
  }

  private async seedHourlyPricing() {
    const hourlyPrices = [
      { vehicleClass: 'business', vehicleName: 'E-Class / BMW 5', pricePerHour: 3000 },
      { vehicleClass: 'minivan', vehicleName: 'Mercedes V-Class', pricePerHour: 5000 },
      { vehicleClass: 'luxury', vehicleName: 'G-Class / S-Class', pricePerHour: 8000 },
    ];

    for (const price of hourlyPrices) {
      await this.hourlyRepo.save(this.hourlyRepo.create(price as any));
    }
  }

  private async seedAirportPricing() {
    const airportPrices = [
      // SVO - Business
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'business', vehicleName: 'E-Class / BMW 5', price: 6000, direction: 'to_airport' },
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'business', vehicleName: 'E-Class / BMW 5', price: 6000, direction: 'from_airport' },
      // SVO - Premium
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'premium', vehicleName: 'S-Class 222 / BMW 7', price: 8000, direction: 'to_airport' },
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'premium', vehicleName: 'S-Class 222 / BMW 7', price: 8000, direction: 'from_airport' },
      // SVO - Minivan
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'minivan', vehicleName: 'Mercedes V-Class', price: 10000, direction: 'to_airport' },
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'minivan', vehicleName: 'Mercedes V-Class', price: 10000, direction: 'from_airport' },
      // SVO - Luxury
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'luxury', vehicleName: 'S-Class W223 / G-Class', price: 12500, direction: 'to_airport' },
      { airportCode: 'SVO', airportName: 'Sheremetyevo', vehicleClass: 'luxury', vehicleName: 'S-Class W223 / G-Class', price: 12500, direction: 'from_airport' },
    ];

    for (const price of airportPrices) {
      await this.airportRepo.save(this.airportRepo.create(price as any));
    }
  }

  private async seedIntercityPricing() {
    const intercityPrices = [
      { vehicleClass: 'business', vehicleName: 'E-Class / BMW 5', pricePerKm: 80 },
      { vehicleClass: 'premium', vehicleName: 'S-Class 222 / BMW 7', pricePerKm: 100 },
      { vehicleClass: 'minivan', vehicleName: 'Mercedes V-Class', pricePerKm: 120 },
      { vehicleClass: 'luxury', vehicleName: 'S-Class W223 / G-Class', pricePerKm: 150 },
    ];

    for (const price of intercityPrices) {
      await this.intercityRepo.save(this.intercityRepo.create(price as any));
    }
  }
}
