import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { HourlyPricing } from '../entities/hourly-pricing.entity';
import { AirportPricing } from '../entities/airport-pricing.entity';
import { IntercityPricing } from '../entities/intercity-pricing.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    
    @InjectRepository(Route)
    private routeRepo: Repository<Route>,
    
    @InjectRepository(HourlyPricing)
    private hourlyRepo: Repository<HourlyPricing>,
    
    @InjectRepository(AirportPricing)
    private airportRepo: Repository<AirportPricing>,
    
    @InjectRepository(IntercityPricing)
    private intercityRepo: Repository<IntercityPricing>,
  ) {}

  // Bookings Management
  async getAllBookingsAdmin() {
    return this.bookingRepo.find({
      relations: ['route'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingsByStatus(status: BookingStatus) {
    return this.bookingRepo.find({
      where: { status },
      relations: ['route'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBooking(id: string, data: Partial<Booking>) {
    await this.bookingRepo.update(id, data);
    return this.bookingRepo.findOne({ where: { id }, relations: ['route'] });
  }

  async deleteBooking(id: string) {
    await this.bookingRepo.delete(id);
    return { message: 'Booking deleted successfully' };
  }

  // Routes Management
  async getAllRoutesAdmin() {
    return this.routeRepo.find({
      relations: ['bookings'],
      order: { from: 'ASC' },
    });
  }

  async createRoute(data: Partial<Route>) {
    const route = this.routeRepo.create(data);
    return this.routeRepo.save(route);
  }

  async updateRoute(id: string, data: Partial<Route>) {
    await this.routeRepo.update(id, data);
    return this.routeRepo.findOne({ where: { id } });
  }

  async deleteRoute(id: string) {
    await this.routeRepo.delete(id);
    return { message: 'Route deleted successfully' };
  }

  // Pricing Management
  async updateHourlyPrice(id: string, data: Partial<HourlyPricing>) {
    await this.hourlyRepo.update(id, data);
    return this.hourlyRepo.findOne({ where: { id } });
  }

  async updateAirportPrice(id: string, data: Partial<AirportPricing>) {
    await this.airportRepo.update(id, data);
    return this.airportRepo.findOne({ where: { id } });
  }

  async updateIntercityPrice(id: string, data: Partial<IntercityPricing>) {
    await this.intercityRepo.update(id, data);
    return this.intercityRepo.findOne({ where: { id } });
  }

  // Statistics
  async getStatistics() {
    const totalBookings = await this.bookingRepo.count();
    const pendingBookings = await this.bookingRepo.count({
      where: { status: BookingStatus.PENDING },
    });
    const confirmedBookings = await this.bookingRepo.count({
      where: { status: BookingStatus.CONFIRMED },
    });
    const completedBookings = await this.bookingRepo.count({
      where: { status: BookingStatus.COMPLETED },
    });

    const totalRevenue = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.status != :cancelled', { cancelled: BookingStatus.CANCELLED })
      .select('SUM(booking.price)', 'total')
      .getRawOne();

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
    };
  }
}
