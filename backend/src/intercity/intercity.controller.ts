import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InterCityService } from './intercity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('intercity')
export class InterCityController {
  constructor(private readonly intercityService: InterCityService) {}

  /** Публичный: список предустановленных направлений */
  @Get('destinations')
  findAll() {
    return this.intercityService.findAll();
  }

  /** Публичный: расчёт расстояния */
  @Get('distance')
  calculateDistance(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.intercityService.calculateDistance(from, to);
  }

  /** Публичный: подсказка названия города */
  @Get('suggest-city')
  suggestCity(@Query('q') query: string) {
    return this.intercityService.suggestCity(query ?? '');
  }

  /** Публичный: засеять */
  @Get('seed')
  seed(@Query('force') force?: string) {
    return this.intercityService.seed(force === 'true');
  }

  @Post('destinations')
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) {
    return this.intercityService.create(data);
  }

  @Patch('destinations/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) {
    return this.intercityService.update(Number(id), data);
  }

  @Delete('destinations/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.intercityService.remove(Number(id));
  }
}
