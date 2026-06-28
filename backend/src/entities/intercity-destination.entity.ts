import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('intercity_destinations')
export class InterCityDestination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'int' })
  distanceKm: number;

  /** Базовая стоимость рейса (70 000 ₽ для фиксированных направлений, 0 для расчётных) */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  /** true = направление показывается в списке предложений */
  @Column({ default: true })
  isPredefined: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
