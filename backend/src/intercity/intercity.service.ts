import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterCityDestination } from '../entities/intercity-destination.entity';
import { resolveCityName } from './city-names';
import { geocodeCity, isServiceCountry, suggestCityName } from './city-geocoding';

export type DistanceResult = {
  distanceKm: number;
  found: boolean;
  /** Почему расстояние не определено: город не найден или вне зоны обслуживания. */
  reason?: 'not_found' | 'outside_service_area';
  /** Город, из-за которого маршрут отклонён. */
  outsideCity?: string;
};

const SEED_DESTINATIONS = [
  { from: 'Москва', to: 'Санкт-Петербург', distanceKm: 705, basePrice: 70000, sortOrder: 1 },
  { from: 'Санкт-Петербург', to: 'Москва', distanceKm: 705, basePrice: 70000, sortOrder: 2 },
  { from: 'Москва', to: 'Казань', distanceKm: 820, basePrice: 70000, sortOrder: 3 },
  { from: 'Казань', to: 'Москва', distanceKm: 820, basePrice: 70000, sortOrder: 4 },
  { from: 'Москва', to: 'Минск', distanceKm: 740, basePrice: 70000, sortOrder: 5 },
  { from: 'Минск', to: 'Москва', distanceKm: 740, basePrice: 70000, sortOrder: 6 },
  { from: 'Москва', to: 'Владимир', distanceKm: 190, basePrice: 70000, sortOrder: 7 },
  { from: 'Владимир', to: 'Москва', distanceKm: 190, basePrice: 70000, sortOrder: 8 },
];

@Injectable()
export class InterCityService {
  constructor(
    @InjectRepository(InterCityDestination)
    private destinationRepo: Repository<InterCityDestination>,
  ) { }

  async findAll() {
    const count = await this.destinationRepo.count();
    if (count === 0) await this.seed();
    return this.destinationRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findAllAdmin() {
    return this.destinationRepo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  findOne(id: number) {
    return this.destinationRepo.findOne({ where: { id } });
  }

  create(data: Partial<InterCityDestination>) {
    return this.destinationRepo.save(this.destinationRepo.create(data));
  }

  async update(id: number, data: Partial<InterCityDestination>) {
    await this.destinationRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.destinationRepo.delete(id);
    return { message: 'Destination deleted' };
  }

  /** Подсказка названия города (постоянные маршруты + геопоиск) */
  async suggestCity(query: string) {
    const knownCities = await this.getKnownCityNames();
    return suggestCityName(query, knownCities);
  }

  /** Рассчитать расстояние между городами через OSRM + Nominatim */
  async calculateDistance(from: string, to: string): Promise<DistanceResult> {
    const knownCities = await this.getKnownCityNames();
    const normalizedFrom = resolveCityName(from, knownCities);
    const normalizedTo = resolveCityName(to, knownCities);

    const effectiveFrom =
      knownCities.includes(normalizedFrom) || normalizedFrom !== from.trim()
        ? normalizedFrom
        : from.trim();

    const effectiveTo =
      knownCities.includes(normalizedTo) || normalizedTo !== to.trim()
        ? normalizedTo
        : to.trim();

    // Сначала смотрим в базе
    const stored = await this.destinationRepo.findOne({
      where: { from: effectiveFrom, to: effectiveTo, isActive: true },
    });
    if (stored) {
      return { distanceKm: stored.distanceKm, found: true };
    }

    try {
      const [coordFrom, coordTo] = await Promise.all([
        geocodeCity(effectiveFrom),
        geocodeCity(effectiveTo),
      ]);

      if (!coordFrom || !coordTo) {
        return { distanceKm: 0, found: false, reason: 'not_found' };
      }

      const outsideCity = !isServiceCountry(coordFrom.countryCode)
        ? effectiveFrom
        : !isServiceCountry(coordTo.countryCode)
          ? effectiveTo
          : null;

      if (outsideCity) {
        return {
          distanceKm: 0,
          found: false,
          reason: 'outside_service_area',
          outsideCity,
        };
      }

      const url = `https://router.project-osrm.org/route/v1/driving/${coordFrom.lon},${coordFrom.lat};${coordTo.lon},${coordTo.lat}?overview=false`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'noir-ride-app/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) throw new Error('OSRM error');

      const data = await res.json() as any;
      const meters = data?.routes?.[0]?.distance;
      if (!meters) return { distanceKm: 0, found: false, reason: 'not_found' };

      const distanceKm = Math.round(meters / 1000);
      return { distanceKm, found: true };
    } catch {
      return { distanceKm: 0, found: false, reason: 'not_found' };
    }
  }

  private async getKnownCityNames(): Promise<string[]> {
    const destinations = await this.destinationRepo.find({
      where: { isActive: true },
      select: ['from', 'to'],
    });
    const cities = new Set<string>();
    for (const d of destinations) {
      cities.add(d.from);
      cities.add(d.to);
    }
    return [...cities];
  }

  async seed(force = false) {
    const count = await this.destinationRepo.count();
    if (count > 0 && !force) return { message: 'Already seeded', count };

    for (const d of SEED_DESTINATIONS) {
      const existing = await this.destinationRepo.findOne({
        where: { from: d.from, to: d.to },
      });
      if (existing) {
        await this.destinationRepo.update(existing.id, d);
      } else {
        await this.destinationRepo.save(this.destinationRepo.create({ ...d, isPredefined: true }));
      }
    }
    return { message: 'Seeded', count: SEED_DESTINATIONS.length };
  }
}
