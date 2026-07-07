import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
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

  @UseGuards(UserJwtAuthGuard)
  @Delete('me/bookings/:type/:id')
  async cancelBooking(
    @Req() req: { user: { id: number } },
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    const bookingId = parseInt(id, 10);
    if (!['route', 'airport', 'hourly'].includes(type)) {
      throw new BadRequestException('Invalid booking type');
    }

    const booking = await this.findUserBooking(req.user.id, type, bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }
    if (booking.paymentStatus === 'succeeded') {
      throw new BadRequestException('Paid bookings cannot be cancelled online');
    }

    const repo = this.getRepo(type);
    await repo.update(bookingId, { status: 'cancelled', paymentStatus: 'canceled' });
    return { ok: true };
  }

  private getRepo(type: string): Repository<RouteBooking | AirportBooking | HourlyBooking> {
    if (type === 'route') return this.routeRepo;
    if (type === 'airport') return this.airportRepo;
    return this.hourlyRepo;
  }

  private async findUserBooking(userId: number, type: string, id: number) {
    const repo = this.getRepo(type);
    const booking = await repo.findOne({ where: { id } });
    if (!booking || booking.userId !== userId) return null;
    return booking;
  }
}
