export class CreatePaymentDto {
  bookingId: number;
  bookingType: 'route' | 'airport' | 'hourly';
  amount: number;
  returnUrl: string;
}
