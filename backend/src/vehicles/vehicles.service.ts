import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';

const SEED_VEHICLES: Partial<Vehicle>[] = [
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class 213',
    category: 'Бизнес-класс',
    description:
      'MERCEDES-BENZ E-CLASS W213 — это эталон бизнес-класса среди седанов. ' +
      'Просторный и тихий салон, безупречная эргономика и фирменный комфорт Mercedes ' +
      'создают идеальную атмосферу для деловых переговоров прямо в пути. ' +
      'Современные системы безопасности, мягкая адаптивная подвеска и развитая ' +
      'мультимедиа делают каждую поездку предсказуемой и приятной.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 5000,
    priceIntercity: 10000,
    priceHourly: 1500,
    pricePerKm: 100,
    sortOrder: 1,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class 213 Рестайлинг',
    category: 'Бизнес-класс',
    description:
      'MERCEDES-BENZ E-CLASS W213 РЕСТАЙЛИНГ — обновлённое поколение флагманского ' +
      'бизнес-седана с расширенным экраном MBUX, улучшенной шумоизоляцией и ' +
      'светодиодными фарами нового поколения. Адаптивный круиз-контроль, система ' +
      'удержания в полосе и ночное видение делают этот автомобиль вершиной ' +
      'технологичности в своём классе.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 5500,
    priceIntercity: 11000,
    priceHourly: 1600,
    pricePerKm: 110,
    sortOrder: 2,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class 214',
    category: 'Бизнес-класс',
    description:
      'MERCEDES-BENZ E-CLASS W214 — абсолютно новое поколение с революционным ' +
      'интерьером и огромным изогнутым дисплеем Superscreen. Искусственный интеллект ' +
      'MBUX подстраивает климат, свет и музыку под предпочтения пассажира. ' +
      'Электрифицированные силовые агрегаты обеспечивают исключительную плавность хода ' +
      'и минимальный уровень шума в салоне.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 6000,
    priceIntercity: 12000,
    priceHourly: 1800,
    pricePerKm: 130,
    sortOrder: 3,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'S-Class 222',
    category: 'Представительский',
    description:
      'MERCEDES-BENZ S-CLASS W222 — флагман представительского класса, задающий ' +
      'стандарты роскоши уже более десяти лет. Массажные сиденья с подогревом и ' +
      'вентиляцией, панорамная крыша, воздушная подвеска Magic Body Control и ' +
      'безупречная шумоизоляция создают атмосферу абсолютного спокойствия. ' +
      'Именно этот автомобиль выбирают для встреч на высшем уровне.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 8000,
    priceIntercity: 15000,
    priceHourly: 2500,
    pricePerKm: 160,
    sortOrder: 4,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'S-Class 223',
    category: 'Представительский',
    description:
      'MERCEDES-BENZ S-CLASS W223 — актуальное поколение самого передового седана ' +
      'в мире. Система полуавтономного вождения DRIVE PILOT, трёхзонный климат-контроль, ' +
      'ароматизация салона с 9 ароматами и амбиентная подсветка с 64 цветами создают ' +
      'неповторимый опыт передвижения. Задние сиденья с функцией массажа превращают ' +
      'каждую поездку в ритуал настоящей роскоши.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 9000,
    priceIntercity: 17000,
    priceHourly: 2800,
    pricePerKm: 180,
    sortOrder: 5,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Maybach 222',
    category: 'Ультра-люкс',
    description:
      'MERCEDES-MAYBACH S-CLASS W222 — это вершина роскоши в сегменте седанов. ' +
      'Элегантный дизайн и высококачественные материалы подчёркивают статус автомобиля. ' +
      'Интерьер ориентирован на комфорт пассажиров с функциями массажа и ' +
      'индивидуальными мультимедийными системами. Удлинённый кузов, холодильник ' +
      'для шампанского и шторки приватности создают атмосферу частного самолёта на колёсах.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 12000,
    priceIntercity: 22000,
    priceHourly: 3500,
    pricePerKm: 250,
    sortOrder: 6,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Maybach 223',
    category: 'Ультра-люкс',
    description:
      'MERCEDES-MAYBACH S-CLASS W223 — новейшее воплощение ультра-роскоши с ' +
      'интерьером уровня частного самолёта. Задние сиденья раскладываются в горизонтальное ' +
      'положение, встроенный фирменный парфюм наполняет салон изысканным ароматом, ' +
      'а эксклюзивная двухтоновая окраска делает этот Maybach узнаваемым с первого взгляда. ' +
      'MBUX Hyperscreen обеспечивает полный контроль над всеми функциями.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 14000,
    priceIntercity: 25000,
    priceHourly: 4000,
    pricePerKm: 280,
    sortOrder: 7,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'G-Class 463',
    category: 'Внедорожник',
    description:
      'MERCEDES-BENZ G-CLASS W463 — легендарный внедорожник с культовым дизайном, ' +
      'не меняющимся десятилетиями. Высокая посадка, мощный двигатель AMG и три ' +
      'принудительно блокируемых дифференциала сочетаются с роскошным кожаным салоном ' +
      'и современными системами безопасности. Для тех, кто выбирает характер, ' +
      'превосходство и абсолютную уверенность на любой дороге.',
    passengers: 3,
    luggage: '2 больших или 3 маленьких',
    childSeat: true,
    priceAirport: 11000,
    priceIntercity: 20000,
    priceHourly: 3200,
    pricePerKm: 200,
    sortOrder: 8,
  },
];

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private repo: Repository<Vehicle>,
  ) {}

  async findAll(activeOnly = true) {
    const count = await this.repo.count();
    if (count === 0) await this.seed();

    const where = activeOnly ? { isActive: true } : {};
    return this.repo.find({ where, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Vehicle>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Vehicle>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { message: 'Vehicle deleted' };
  }

  /**
   * Seed — if force=true, syncs descriptions/specs for existing records
   * matching by brand+model, and inserts any missing ones.
   */
  async seed(force = false) {
    const count = await this.repo.count();

    if (count === 0) {
      // Fresh insert
      for (const v of SEED_VEHICLES) {
        await this.repo.save(this.repo.create(v));
      }
      return { message: 'Vehicles seeded', count: SEED_VEHICLES.length };
    }

    if (!force) {
      return { message: 'Already seeded', count };
    }

    // Force mode — upsert by brand+model
    for (const v of SEED_VEHICLES) {
      const existing = await this.repo.findOne({
        where: { brand: v.brand, model: v.model },
      });

      if (existing) {
        await this.repo.update(existing.id, {
          category: v.category,
          description: v.description,
          passengers: v.passengers,
          luggage: v.luggage,
          childSeat: v.childSeat,
          priceAirport: v.priceAirport,
          priceIntercity: v.priceIntercity,
          priceHourly: v.priceHourly,
          pricePerKm: v.pricePerKm,
          sortOrder: v.sortOrder,
        });
      } else {
        await this.repo.save(this.repo.create(v));
      }
    }

    return { message: 'Vehicles reseeded (force)', count: SEED_VEHICLES.length };
  }
}

