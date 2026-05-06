import { IsString, IsEmail, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Matches } from 'class-validator';
import { ServiceType } from '../../entities/booking.entity';

export class CreateBookingDto {
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsDateString()
  @IsNotEmpty()
  departureDate: string;

  @IsString()
  @IsOptional()
  departureTime?: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsNumber()
  @IsNotEmpty()
  passengers: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid (E.164 format)',
  })
  customerPhone: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  routeId?: string;
}
