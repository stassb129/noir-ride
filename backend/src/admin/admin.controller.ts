import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from '../entities/booking.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Statistics
  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  // Bookings Management
  @Get('bookings')
  async getAllBookings(@Query('status') status?: BookingStatus) {
    if (status) {
      return this.adminService.getBookingsByStatus(status);
    }
    return this.adminService.getAllBookingsAdmin();
  }

  @Patch('bookings/:id')
  async updateBooking(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBooking(id, data);
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id') id: string) {
    return this.adminService.deleteBooking(id);
  }

  // Routes Management
  @Get('routes')
  async getAllRoutes() {
    return this.adminService.getAllRoutesAdmin();
  }

  @Post('routes')
  async createRoute(@Body() data: any) {
    return this.adminService.createRoute(data);
  }

  @Patch('routes/:id')
  async updateRoute(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateRoute(id, data);
  }

  @Delete('routes/:id')
  async deleteRoute(@Param('id') id: string) {
    return this.adminService.deleteRoute(id);
  }

  // Pricing Management
  @Patch('pricing/hourly/:id')
  async updateHourlyPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateHourlyPrice(id, data);
  }

  @Patch('pricing/airport/:id')
  async updateAirportPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAirportPrice(id, data);
  }

  @Patch('pricing/intercity/:id')
  async updateIntercityPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateIntercityPrice(id, data);
  }
}
