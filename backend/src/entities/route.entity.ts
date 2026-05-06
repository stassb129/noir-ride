import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Booking } from './booking.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'int' })
  distanceKm: number;

  @Column({ type: 'int' })
  pricePerSeat: number;

  @Column({ type: 'int', default: 4 })
  totalSeats: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Booking, (booking) => booking.route)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
