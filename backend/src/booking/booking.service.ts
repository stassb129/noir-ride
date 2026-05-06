import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, ServiceType, BookingStatus } from '../entities/booking.entity';
import { Route } from '../entities/route.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    
    @InjectRepository(Route)
    private routeRepo: Repository<Route>,
  ) {}

  async createBooking(dto: CreateBookingDto) {
    // If intercity with route, check seat availability
    if (dto.serviceType === ServiceType.INTERCITY && dto.routeId) {
      const route = await this.routeRepo.findOne({
        where: { id: dto.routeId },
        relations: ['bookings'],
      });

      if (!route) {
        throw new NotFoundException('Route not found');
      }

      // Calculate available seats for this date
      const bookedSeatsOnDate = await this.bookingRepo
        .createQueryBuilder('booking')
        .where('booking.routeId = :routeId', { routeId: dto.routeId })
        .andWhere('booking.departureDate = :date', { date: dto.departureDate })
        .andWhere('booking.status != :cancelled', { cancelled: BookingStatus.CANCELLED })
        .select('SUM(booking.passengers)', 'total')
        .getRawOne();

      const bookedSeats = parseInt(bookedSeatsOnDate?.total || '0', 10);
      const availableSeats = route.totalSeats - bookedSeats;

      if (availableSeats < dto.passengers) {
        throw new BadRequestException(
          `Not enough seats available. Only ${availableSeats} seats left`
        );
      }

      // Create booking with calculated price
      const booking = this.bookingRepo.create({
        ...dto,
        price: route.pricePerSeat * dto.passengers,
        status: BookingStatus.PENDING,
      });

      return this.bookingRepo.save(booking);
    }

    // For other services (airport, hourly), create booking without seat control
    const booking = this.bookingRepo.create({
      ...dto,
      price: 0, // Will be calculated on frontend based on pricing
      status: BookingStatus.PENDING,
    });

    return this.bookingRepo.save(booking);
  }

  async getAllBookings() {
    return this.bookingRepo.find({
      relations: ['route'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingById(id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['route'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.getBookingById(id);
    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async deleteBooking(id: string) {
    const booking = await this.getBookingById(id);
    await this.bookingRepo.remove(booking);
    return { message: 'Booking deleted successfully' };
  }

  // Get available seats for a specific route and date
  async getAvailableSeats(routeId: string, date: string) {
    const route = await this.routeRepo.findOne({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const bookedSeatsOnDate = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.routeId = :routeId', { routeId })
      .andWhere('booking.departureDate = :date', { date })
      .andWhere('booking.status != :cancelled', { cancelled: BookingStatus.CANCELLED })
      .select('SUM(booking.passengers)', 'total')
      .getRawOne();

    const bookedSeats = parseInt(bookedSeatsOnDate?.total || '0', 10);
    const availableSeats = route.totalSeats - bookedSeats;

    return {
      routeId,
      date,
      totalSeats: route.totalSeats,
      bookedSeats,
      availableSeats,
    };
  }

  // Get all routes with their schedules
  async getAllRoutes() {
    return this.routeRepo.find({
      where: { isActive: true },
      order: { from: 'ASC' },
    });
  }

  async seedRoutes() {
    const count = await this.routeRepo.count();
    if (count === 0) {
      const routes = [
        {
          from: 'Москва',
          to: 'Санкт-Петербург',
          distanceKm: 700,
          pricePerSeat: 10000,
          totalSeats: 4,
        },
        {
          from: 'Санкт-Петербург',
          to: 'Москва',
          distanceKm: 700,
          pricePerSeat: 10000,
          totalSeats: 4,
        },
      ];

      for (const route of routes) {
        await this.routeRepo.save(this.routeRepo.create(route));
      }
    }
  }
}
