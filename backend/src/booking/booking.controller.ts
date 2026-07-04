import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '../entities/booking.entity';
import { CreateRouteBookingDto, CreateAirportBookingDto, CreateHourlyBookingDto } from '../dto/specialized-bookings.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  async createBooking(@Body(ValidationPipe) dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @Post('route')
  async createRouteBooking(@Body(ValidationPipe) dto: CreateRouteBookingDto) {
    return this.bookingService.createRouteBooking(dto);
  }

  @Post('airport')
  async createAirportBooking(@Body(ValidationPipe) dto: CreateAirportBookingDto) {
    return this.bookingService.createAirportBooking(dto);
  }

  @Post('hourly')
  async createHourlyBooking(@Body(ValidationPipe) dto: CreateHourlyBookingDto) {
    return this.bookingService.createHourlyBooking(dto);
  }

  // Get all specialized bookings
  @Get('route')
  async getAllRouteBookings() {
    return this.bookingService.getAllRouteBookings();
  }

  @Get('airport')
  async getAllAirportBookings() {
    return this.bookingService.getAllAirportBookings();
  }

  @Get('hourly')
  async getAllHourlyBookings() {
    return this.bookingService.getAllHourlyBookings();
  }

  // Update and delete specialized bookings
  @Patch('route/:id')
  async updateRouteBooking(@Param('id') id: string, @Body() updateData: any) {
    return this.bookingService.updateRouteBooking(parseInt(id), updateData);
  }

  @Patch('airport/:id')
  async updateAirportBooking(@Param('id') id: string, @Body() updateData: any) {
    return this.bookingService.updateAirportBooking(parseInt(id), updateData);
  }

  @Patch('hourly/:id')
  async updateHourlyBooking(@Param('id') id: string, @Body() updateData: any) {
    return this.bookingService.updateHourlyBooking(parseInt(id), updateData);
  }

  @Delete('route/:id')
  async deleteRouteBooking(@Param('id') id: string) {
    return this.bookingService.deleteRouteBooking(parseInt(id));
  }

  @Delete('airport/:id')
  async deleteAirportBooking(@Param('id') id: string) {
    return this.bookingService.deleteAirportBooking(parseInt(id));
  }

  @Delete('hourly/:id')
  async deleteHourlyBooking(@Param('id') id: string) {
    return this.bookingService.deleteHourlyBooking(parseInt(id));
  }

  @Get()
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get('routes')
  async getAllRoutes() {
    return this.bookingService.getAllRoutes();
  }

  @Get('routes/seed')
  async seedRoutes() {
    await this.bookingService.seedRoutes();
    return { message: 'Routes seeded successfully' };
  }

  @Get('availability')
  async getAvailableSeats(
    @Query('routeId') routeId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableSeats(routeId, date);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(':id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingService.updateBookingStatus(id, status);
  }

  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingService.deleteBooking(id);
  }
}
