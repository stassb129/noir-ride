import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VehicleClass } from './hourly-pricing.entity';

export enum AirportCode {
  SVO = 'SVO', // Sheremetyevo
  DME = 'DME', // Domodedovo
  VKO = 'VKO', // Vnukovo
}

export enum TransferDirection {
  TO_AIRPORT = 'to_airport',     // Москва → Аэропорт
  FROM_AIRPORT = 'from_airport', // Аэропорт → Москва
}

@Entity('airport_pricing')
export class AirportPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AirportCode })
  airportCode: AirportCode;

  @Column()
  airportName: string;

  @Column({ type: 'enum', enum: VehicleClass })
  vehicleClass: VehicleClass;

  @Column()
  vehicleName: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: TransferDirection })
  direction: TransferDirection;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
