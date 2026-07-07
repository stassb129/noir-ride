import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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

  private get credentials(): { shopId: string; secretKey: string } {
    const shopId = this.configService.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY');
    if (!shopId || !secretKey) {
      throw new BadRequestException('YooKassa credentials not configured (YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY missing)');
    }
    return { shopId, secretKey };
  }

  private authHeader(): string {
    const { shopId, secretKey } = this.credentials;
    return 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
  }

  async createPayment(
    userId: number,
    dto: CreatePaymentDto,
  ): Promise<{ paymentId: string; confirmationUrl: string }> {
    const { bookingId, bookingType, returnUrl } = dto;

    const booking = await this.findBooking(bookingId, bookingType);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Access denied');

    if (booking.status !== 'pending') {
      throw new BadRequestException('Booking is not awaiting payment');
    }
    if (booking.paymentStatus === 'succeeded') {
      throw new BadRequestException('Booking already paid');
    }

    const amount = Number(booking.price);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Booking has no price set');
    }

    const idempotenceKey = `${bookingType}-${bookingId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const body = {
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true,
      expires_at: expiresAt,
      description: `NOIR RIDE — заказ #${bookingId} (${this.typeLabel(bookingType)})`,
      metadata: { bookingId: String(bookingId), bookingType },
    };

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': idempotenceKey,
          Authorization: this.authHeader(),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      this.logger.error(`YooKassa network error: ${msg}`);
      throw new BadRequestException(`YooKassa network error: ${msg}`);
    }

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`YooKassa API error ${response.status}: ${text}`);
      throw new BadRequestException(`YooKassa error ${response.status}: ${text.slice(0, 200)}`);
    }

    const payment: YooKassaPayment = await response.json();
    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      throw new BadRequestException('YooKassa did not return a confirmation URL');
    }

    // Save paymentId to DB — non-critical, don't let DB errors block redirect
    this.savePaymentId(bookingId, bookingType, payment.id, 'pending').catch((err: unknown) => {
      this.logger.warn(`savePaymentId failed (likely missing DB column — run DB_SYNC=true once): ${String(err)}`);
    });

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
      this.logger.warn('Webhook: missing metadata bookingId/bookingType');
      return;
    }

    this.logger.log(`Webhook: payment ${payment.id} → ${payment.status} (${bookingType} #${bookingId})`);

    try {
      await this.savePaymentId(bookingId, bookingType, payment.id, payment.status);
    } catch (err) {
      this.logger.warn(`Webhook savePaymentId failed: ${String(err)}`);
    }

    if (payment.status === 'succeeded') {
      try {
        await this.updateBookingStatus(bookingId, bookingType, 'confirmed');
      } catch (err) {
        this.logger.warn(`Webhook updateBookingStatus failed: ${String(err)}`);
      }
      await this.notifyPaymentSuccess(bookingId, bookingType, payment.id);
    }

    if (payment.status === 'canceled' || payment.status === 'cancelled') {
      this.logger.warn(`Payment ${payment.id} canceled for ${bookingType} #${bookingId}`);
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/${paymentId}`, {
        headers: { Authorization: this.authHeader() },
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new BadRequestException('Failed to reach YooKassa');
    }
    if (!response.ok) throw new BadRequestException('Payment not found');
    return response.json() as Promise<YooKassaPayment>;
  }

  private async findBooking(
    id: number,
    type: CreatePaymentDto['bookingType'],
  ): Promise<RouteBooking | AirportBooking | HourlyBooking | null> {
    switch (type) {
      case 'route': return this.routeRepo.findOne({ where: { id } });
      case 'airport': return this.airportRepo.findOne({ where: { id } });
      case 'hourly': return this.hourlyRepo.findOne({ where: { id } });
      default: return null;
    }
  }

  private async savePaymentId(id: number, type: string, paymentId: string, paymentStatus: string) {
    const normalizedStatus = paymentStatus === 'cancelled' ? 'canceled' : paymentStatus;
    const update = { paymentId, paymentStatus: normalizedStatus };
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
