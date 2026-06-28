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
  @Post('pricing/hourly')
  async createHourlyPrice(@Body() data: any) {
    return this.adminService.createHourlyPrice(data);
  }

  @Patch('pricing/hourly/:id')
  async updateHourlyPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateHourlyPrice(id, data);
  }

  @Delete('pricing/hourly/:id')
  async deleteHourlyPrice(@Param('id') id: string) {
    return this.adminService.deleteHourlyPrice(id);
  }

  @Post('pricing/airport')
  async createAirportPrice(@Body() data: any) {
    return this.adminService.createAirportPrice(data);
  }

  @Patch('pricing/airport/:id')
  async updateAirportPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAirportPrice(id, data);
  }

  @Delete('pricing/airport/:id')
  async deleteAirportPrice(@Param('id') id: string) {
    return this.adminService.deleteAirportPrice(id);
  }

  @Post('pricing/intercity')
  async createIntercityPrice(@Body() data: any) {
    return this.adminService.createIntercityPrice(data);
  }

  @Patch('pricing/intercity/:id')
  async updateIntercityPrice(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateIntercityPrice(id, data);
  }

  @Delete('pricing/intercity/:id')
  async deleteIntercityPrice(@Param('id') id: string) {
    return this.adminService.deleteIntercityPrice(id);
  }

  // Fleet Management
  @Get('vehicles')
  async getAllVehicles() {
    return this.adminService.getAllVehicles();
  }

  @Post('vehicles')
  async createVehicle(@Body() data: any) {
    return this.adminService.createVehicle(data);
  }

  @Patch('vehicles/:id')
  async updateVehicle(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateVehicle(Number(id), data);
  }

  @Delete('vehicles/:id')
  async deleteVehicle(@Param('id') id: string) {
    return this.adminService.deleteVehicle(Number(id));
  }

  // InterCity Destinations Management
  @Get('intercity')
  async getAllDestinations() {
    return this.adminService.getAllDestinations();
  }

  @Post('intercity')
  async createDestination(@Body() data: any) {
    return this.adminService.createDestination(data);
  }

  @Patch('intercity/:id')
  async updateDestination(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateDestination(Number(id), data);
  }

  @Delete('intercity/:id')
  async deleteDestination(@Param('id') id: string) {
    return this.adminService.deleteDestination(Number(id));
  }
}
