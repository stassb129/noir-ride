import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Route } from './route.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum ServiceType {
  INTERCITY = 'intercity',
  AIRPORT = 'airport',
  HOURLY = 'hourly',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  // For intercity bookings
  @ManyToOne(() => Route, (route) => route.bookings, { nullable: true })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @Column({ nullable: true })
  routeId: string;

  // General fields
  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'date' })
  departureDate: Date;

  @Column({ type: 'varchar', nullable: true })
  departureTime: string;

  @Column()
  vehicleType: string;

  @Column({ type: 'int' })
  passengers: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  // Customer info
  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
