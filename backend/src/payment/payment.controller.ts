import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus, Logger, ValidationPipe, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './payment.dto';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(UserJwtAuthGuard)
  @Post('create')
  async createPayment(@Req() req: { user: { id: number } }, @Body(ValidationPipe) dto: CreatePaymentDto) {
    return this.paymentService.createPayment(req.user.id, dto);
  }

  @Get(':paymentId')
  async getPayment(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentService.getPayment(paymentId);
    return { id: payment.id, status: payment.status };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: unknown) {
    this.logger.log(`Webhook received: ${JSON.stringify(body)}`);
    await this.paymentService.handleWebhook(body);
    return { ok: true };
  }
}
