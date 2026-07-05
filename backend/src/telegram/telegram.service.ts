import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyAgent, type Dispatcher } from 'undici';
import { RouteBooking, AirportBooking, HourlyBooking } from '../entities/specialized-bookings.entity';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string | null;
  private readonly chatId: string | null;
  private readonly adminUrl: string;
  private readonly dispatcher: Dispatcher | undefined;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? null;
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') ?? null;
    this.adminUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://noir-ride.ru';

    const proxy = this.configService.get<string>('TELEGRAM_PROXY');
    this.dispatcher = proxy ? new ProxyAgent(proxy) : undefined;

    if (this.enabled) {
      this.logger.log(
        proxy
          ? 'Telegram notifications enabled (via proxy)'
          : 'Telegram notifications enabled',
      );
    } else {
      this.logger.warn(
        'Telegram notifications disabled — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID',
      );
    }
  }

  private get enabled(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  private formatFetchError(err: unknown): string {
    if (!(err instanceof Error)) return String(err);

    const cause = err.cause;
    if (cause instanceof Error) {
      const code = 'code' in cause ? String(cause.code) : '';
      return code ? `${err.message} (${code}: ${cause.message})` : `${err.message} (${cause.message})`;
    }

    return err.message;
  }

  private async send(text: string): Promise<void> {
    if (!this.enabled) return;
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(10000),
        // @ts-expect-error undici dispatcher is supported by Node fetch
        dispatcher: this.dispatcher,
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`Telegram API error ${response.status}: ${body.slice(0, 200)}`);
      }
    } catch (err) {
      this.logger.warn(`Telegram notification failed: ${this.formatFetchError(err)}`);
    }
  }

  private driverLabel(pref: string | null | undefined): string {
    switch (pref) {
      case 'male': return '👨 Мужчина';
      case 'female': return '👩 Женщина';
      default: return '—';
    }
  }

  private adminLink(section: string, id: number): string {
    return `${this.adminUrl}/ru/admin/bookings`;
  }

  async notifyRouteBooking(b: RouteBooking): Promise<void> {
    const lines = [
      `🚗 <b>Новый заказ — Межгород #${b.id}</b>`,
      ``,
      `👤 <b>${b.name}</b>`,
      `📞 ${b.phone}`,
      `📧 ${b.email}`,
      ``,
      `📍 Маршрут: <b>${b.from} → ${b.to}</b>`,
      `📅 Дата: ${b.date}  🕐 Время: ${b.time}`,
      `🚘 Автомобиль: ${b.vehicleName || '—'}`,
      `👥 Пассажиров: ${b.passengers}`,
      b.distanceKm ? `📏 Расстояние: ${b.distanceKm} км` : null,
      b.price ? `💰 Сумма: ${Number(b.price).toLocaleString('ru-RU')} ₽` : null,
      `👨‍✈️ Водитель: ${this.driverLabel(b.driverPreference)}`,
      b.notes ? `💬 Комментарий: ${b.notes}` : null,
      ``,
      `🔗 <a href="${this.adminLink('routes', b.id)}">Открыть в админке</a>`,
    ];
    await this.send(lines.filter((l) => l !== null).join('\n'));
  }

  async notifyAirportBooking(b: AirportBooking): Promise<void> {
    const type = b.serviceType === 'pickup' ? '✈️→🚗 Встреча' : '🚗→✈️ Проводы';
    const lines = [
      `✈️ <b>Новый заказ — Аэропорт #${b.id}</b>`,
      ``,
      `👤 <b>${b.name}</b>`,
      `📞 ${b.phone}`,
      `📧 ${b.email}`,
      ``,
      `🔄 Тип: <b>${type}</b>`,
      `🏢 Аэропорт: ${b.airport}`,
      `📍 Адрес: ${b.address}`,
      `📅 Дата: ${b.date}  🕐 Время: ${b.time}`,
      b.flightNumber ? `🛫 Рейс: ${b.flightNumber}` : null,
      `🚘 Автомобиль: ${b.vehicleName || '—'}`,
      `👥 Пассажиров: ${b.passengers}`,
      `🧳 Багаж: ${b.luggage}`,
      b.serviceType === 'pickup'
        ? (b.meetSign
            ? `🪧 Табличка: ${b.meetSignText || b.name}`
            : '📞 Встреча: по звонку')
        : null,
      `🛣 Платные дороги: ${b.useTollRoads ? 'можно' : 'без платных'}`,
      `👨‍✈️ Водитель: ${this.driverLabel(b.driverPreference)}`,
      b.notes ? `💬 Комментарий: ${b.notes}` : null,
      ``,
      `🔗 <a href="${this.adminLink('airport', b.id)}">Открыть в админке</a>`,
    ];
    await this.send(lines.filter((l) => l !== null).join('\n'));
  }

  async notifyHourlyBooking(b: HourlyBooking): Promise<void> {
    const lines = [
      `⏱ <b>Новый заказ — Почасовая #${b.id}</b>`,
      ``,
      `👤 <b>${b.name}</b>`,
      `📞 ${b.phone}`,
      `📧 ${b.email}`,
      ``,
      `📍 Адрес подачи: ${b.pickupAddress}`,
      `📅 Дата: ${b.date}  🕐 Время: ${b.time}`,
      `⏳ Часов: ${b.hours}`,
      `🚘 Автомобиль: ${b.vehicleName || '—'}`,
      `👥 Пассажиров: ${b.passengers}`,
      `👨‍✈️ Водитель: ${this.driverLabel(b.driverPreference)}`,
      b.notes ? `💬 Комментарий: ${b.notes}` : null,
      ``,
      `🔗 <a href="${this.adminLink('hourly', b.id)}">Открыть в админке</a>`,
    ];
    await this.send(lines.filter((l) => l !== null).join('\n'));
  }

  async notifyContactForm(data: {
    id: number;
    name: string;
    phone: string;
    message?: string;
    source?: string;
  }): Promise<void> {
    const lines = [
      `📩 <b>Новая заявка — Контакт #${data.id}</b>`,
      ``,
      `👤 <b>${data.name}</b>`,
      `📞 ${data.phone}`,
      data.message ? `💬 ${data.message}` : null,
      data.source ? `📌 Источник: ${data.source}` : null,
      ``,
      `🔗 <a href="${this.adminLink('contacts', data.id)}">Открыть в админке</a>`,
    ];
    await this.send(lines.filter((l) => l !== null).join('\n'));
  }
}
