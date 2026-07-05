import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('route_bookings')
export class RouteBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ nullable: true })
  vehicleClass: string;

  @Column({ nullable: true })
  vehicleName: string;

  @Column({ nullable: true, type: 'int' })
  vehicleId: number;

  @Column()
  passengers: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'confirmed', 'completed', 'cancelled'

  @Column({ type: 'int', nullable: true })
  distanceKm: number;

  @Column({ type: 'varchar', length: 16, default: 'any' })
  driverPreference: string; // 'male' | 'female' | 'any'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('airport_bookings')
export class AirportBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  serviceType: string; // 'pickup' or 'dropoff'

  @Column()
  airport: string;

  @Column()
  address: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ nullable: true })
  flightNumber: string;

  @Column({ nullable: true })
  vehicleClass: string;

  @Column({ nullable: true })
  vehicleName: string;

  @Column({ nullable: true, type: 'int' })
  vehicleId: number;

  @Column()
  passengers: number;

  @Column()
  luggage: number;

  @Column({ default: false })
  meetSign: boolean;

  @Column({ type: 'varchar', nullable: true })
  meetSignText: string | null;

  @Column({ default: false })
  useTollRoads: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 16, default: 'any' })
  driverPreference: string; // 'male' | 'female' | 'any'

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('hourly_bookings')
export class HourlyBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  pickupAddress: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  hours: number;

  @Column({ nullable: true })
  vehicleClass: string;

  @Column({ nullable: true })
  vehicleName: string;

  @Column({ nullable: true, type: 'int' })
  vehicleId: number;

  @Column()
  passengers: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 16, default: 'any' })
  driverPreference: string; // 'male' | 'female' | 'any'

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}
