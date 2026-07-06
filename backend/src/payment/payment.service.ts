import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteBooking, AirportBooking, HourlyBooking } from '../entities/specialized-bookings.entity';
import { TelegramService } from '../telegram/telegram.service';
import { CreatePaymentDto } from './payment.dto';

export { CreatePaymentDto };

interface YooKassaPayment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  confirmation?: { confirmation_url?: string };
  metadata?: Record<string, string>;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly apiUrl = 'https://api.yookassa.ru/v3/payments';

  constructor(
    private configService: ConfigService,
    @InjectRepository(RouteBooking)
    private routeRepo: Repository<RouteBooking>,
    @InjectRepository(AirportBooking)
    private airportRepo: Repository<AirportBooking>,
    @InjectRepository(HourlyBooking)
    private hourlyRepo: Repository<HourlyBooking>,
    private telegramService: TelegramService,
  ) {}

  private get credentials() {
    const shopId = this.configService.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY');
    if (!shopId || !secretKey) throw new BadRequestException('YooKassa credentials not configured');
    return { shopId, secretKey };
  }

  private authHeader(): string {
    const { shopId, secretKey } = this.credentials;
    return 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
  }

  async createPayment(dto: CreatePaymentDto): Promise<{ paymentId: string; confirmationUrl: string }> {
    const { bookingId, bookingType, amount, returnUrl } = dto;

    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const idempotenceKey = `${bookingType}-${bookingId}-${Date.now()}`;

    const body = {
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true,
      description: `NOIR RIDE — заказ #${bookingId} (${this.typeLabel(bookingType)})`,
      metadata: { bookingId: String(bookingId), bookingType },
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: this.authHeader(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`YooKassa createPayment error ${response.status}: ${text}`);
      throw new BadRequestException(`Payment creation failed: ${response.status}`);
    }

    const payment: YooKassaPayment = await response.json();
    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      throw new BadRequestException('YooKassa did not return a confirmation URL');
    }

    await this.savePaymentId(bookingId, bookingType, payment.id, 'pending');
    this.logger.log(`Payment ${payment.id} created for ${bookingType} booking #${bookingId}`);

    return { paymentId: payment.id, confirmationUrl };
  }

  async handleWebhook(body: unknown): Promise<void> {
    const notification = body as { type?: string; event?: string; object?: YooKassaPayment };
    if (notification.type !== 'notification' || !notification.object) return;

    const payment = notification.object;
    const meta = payment.metadata ?? {};
    const bookingId = Number(meta.bookingId);
    const bookingType = meta.bookingType as CreatePaymentDto['bookingType'];

    if (!bookingId || !bookingType) {
      this.logger.warn(`Webhook: missing metadata bookingId/bookingType`);
      return;
    }

    this.logger.log(`Webhook: payment ${payment.id} → ${payment.status} (${bookingType} #${bookingId})`);
    await this.savePaymentId(bookingId, bookingType, payment.id, payment.status);

    if (payment.status === 'succeeded') {
      await this.updateBookingStatus(bookingId, bookingType, 'confirmed');
      await this.notifyPaymentSuccess(bookingId, bookingType, payment.id);
    }

    if (payment.status === 'cancelled') {
      this.logger.warn(`Payment ${payment.id} cancelled for ${bookingType} #${bookingId}`);
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    const response = await fetch(`${this.apiUrl}/${paymentId}`, {
      headers: { Authorization: this.authHeader() },
    });
    if (!response.ok) throw new BadRequestException('Payment not found');
    return response.json() as Promise<YooKassaPayment>;
  }

  private async savePaymentId(id: number, type: string, paymentId: string, paymentStatus: string) {
    const update = { paymentId, paymentStatus };
    switch (type) {
      case 'route': await this.routeRepo.update(id, update); break;
      case 'airport': await this.airportRepo.update(id, update); break;
      case 'hourly': await this.hourlyRepo.update(id, update); break;
    }
  }

  private async updateBookingStatus(id: number, type: string, status: string) {
    switch (type) {
      case 'route': await this.routeRepo.update(id, { status }); break;
      case 'airport': await this.airportRepo.update(id, { status }); break;
      case 'hourly': await this.hourlyRepo.update(id, { status }); break;
    }
  }

  private async notifyPaymentSuccess(bookingId: number, bookingType: string, paymentId: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://noir-ride.ru';
      const text = [
        `💳 <b>Оплата подтверждена!</b>`,
        ``,
        `📋 Заказ: <b>#${bookingId}</b> (${this.typeLabel(bookingType)})`,
        `🔑 Payment ID: <code>${paymentId}</code>`,
        ``,
        `🔗 <a href="${frontendUrl}/ru/admin/bookings">Открыть в админке</a>`,
      ].join('\n');
      await this.telegramService.sendRaw(text);
    } catch {
      // Telegram notification is optional
    }
  }

  private typeLabel(type: string): string {
    if (type === 'route') return 'Межгород';
    if (type === 'airport') return 'Аэропорт';
    if (type === 'hourly') return 'Почасовая';
    return type;
  }
}
