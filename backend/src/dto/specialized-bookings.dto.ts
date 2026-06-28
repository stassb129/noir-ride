import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, IsBoolean, ValidateIf } from 'class-validator';

export class CreateRouteBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsString()
  @IsOptional()
  vehicleName?: string;

  @IsNumber()
  passengers: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAirportBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string; // 'pickup' or 'dropoff'

  @IsString()
  @IsNotEmpty()
  airport: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsString()
  @IsOptional()
  vehicleName?: string;

  @IsNumber()
  passengers: number;

  @IsNumber()
  luggage: number;

  @IsBoolean()
  @IsOptional()
  meetSign?: boolean;

  @ValidateIf((o) => o.meetSign === true)
  @IsString()
  @IsNotEmpty()
  meetSignText?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateHourlyBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  hours: number;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsString()
  @IsOptional()
  vehicleName?: string;

  @IsNumber()
  passengers: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
