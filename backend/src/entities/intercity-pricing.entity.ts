import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VehicleClass } from './hourly-pricing.entity';

@Entity('intercity_pricing')
export class IntercityPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VehicleClass })
  vehicleClass: VehicleClass;

  @Column()
  vehicleName: string;

  @Column({ type: 'int' })
  pricePerKm: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
