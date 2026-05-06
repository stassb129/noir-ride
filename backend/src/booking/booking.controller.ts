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

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body(ValidationPipe) dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
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
