import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a YooKassa payment for a booking.
   * Called by the frontend after a booking is saved.
   */
  @Post('create')
  async createPayment(@Body(ValidationPipe) dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  /**
   * Get payment status by YooKassa paymentId.
   * Used by success page to verify payment.
   */
  @Get(':paymentId')
  async getPayment(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentService.getPayment(paymentId);
    return { id: payment.id, status: payment.status };
  }

  /**
   * YooKassa webhook endpoint.
   * Must be registered in YooKassa merchant dashboard.
   * Listens to payment.succeeded, payment.cancelled events.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: unknown) {
    this.logger.log(`Webhook received: ${JSON.stringify(body)}`);
    await this.paymentService.handleWebhook(body);
    return { ok: true };
  }
}
