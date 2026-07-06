import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { RouteBooking, AirportBooking, HourlyBooking } from '../entities/specialized-bookings.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(RouteBooking)
    private routeRepo: Repository<RouteBooking>,
    @InjectRepository(AirportBooking)
    private airportRepo: Repository<AirportBooking>,
    @InjectRepository(HourlyBooking)
    private hourlyRepo: Repository<HourlyBooking>,
  ) {}

  @UseGuards(UserJwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.toPublic(req.user);
  }

  @UseGuards(UserJwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: any,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(req.user.id, dto);
    return this.usersService.toPublic(updated);
  }

  @UseGuards(UserJwtAuthGuard)
  @Get('me/bookings')
  async getMyBookings(@Req() req: any) {
    const userId = req.user.id;

    const [routes, airports, hourly] = await Promise.all([
      this.routeRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.airportRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.hourlyRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
    ]);

    return {
      routes: routes.map((b) => ({ ...b, type: 'route' })),
      airports: airports.map((b) => ({ ...b, type: 'airport' })),
      hourly: hourly.map((b) => ({ ...b, type: 'hourly' })),
    };
  }
}
