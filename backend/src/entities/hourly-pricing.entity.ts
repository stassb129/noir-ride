import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VehicleClass {
  BUSINESS = 'business', // E-class, BMW 5
  PREMIUM = 'premium',   // S-class 222, BMW 7
  MINIVAN = 'minivan',   // Mercedes V-Class
  LUXURY = 'luxury',     // S-class W223, G-Class
}

@Entity('hourly_pricing')
export class HourlyPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VehicleClass })
  vehicleClass: VehicleClass;

  @Column()
  vehicleName: string;

  @Column({ type: 'int' })
  pricePerHour: number;

  @Column({ type: 'int', default: 3 })
  minimumHours: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
