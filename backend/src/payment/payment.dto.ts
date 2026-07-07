import { IsIn, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  bookingId: number;

  @IsIn(['route', 'airport', 'hourly'])
  bookingType: 'route' | 'airport' | 'hourly';

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  returnUrl: string;
}
