import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Mercedes-Benz' })
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string; // e.g. 'Бизнес-класс', 'Представительский', 'Внедорожник'

  @Column({ default: 3 })
  passengers: number;

  @Column({ nullable: true })
  luggage: string; // e.g. '2 больших или 3 маленьких'

  @Column({ default: false })
  childSeat: boolean; // детское кресло/бустер по запросу

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAirport: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceIntercity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceHourly: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
  pricePerKm: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
