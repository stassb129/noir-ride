import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AdminUser } from '../../entities/admin-user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AdminUser)
    private adminRepo: Repository<AdminUser>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key',
    });
  }

  async validate(payload: any) {
    const admin = await this.adminRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
