import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone, isActive: true } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id, isActive: true } });
  }

  async create(phone: string, passwordHash: string, name?: string): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException('Пользователь с таким номером уже зарегистрирован');
    }

    const user = this.usersRepo.create({ phone, passwordHash, name: name ?? null });
    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;

    return this.usersRepo.save(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
