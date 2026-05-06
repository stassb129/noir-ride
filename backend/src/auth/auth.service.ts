import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminRepo: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<AdminUser> {
    const admin = await this.adminRepo.findOne({
      where: { email, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);

    // Update last login
    admin.lastLoginAt = new Date();
    await this.adminRepo.save(admin);

    const payload = { email: admin.email, sub: admin.id, name: admin.name };
    
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  async createAdmin(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = this.adminRepo.create({
      email,
      password: hashedPassword,
      name,
    });

    return this.adminRepo.save(admin);
  }

  async seedDefaultAdmin() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      await this.createAdmin('admin@noirride.com', 'admin123456', 'Admin');
      console.log('✅ Default admin created: admin@noirride.com / admin123456');
    }
  }
}
