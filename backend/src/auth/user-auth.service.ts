import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto/user.dto';

@Injectable()
export class UserAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.phone, passwordHash, dto.name);

    const token = this.signToken(user.id, user.phone);
    return { access_token: token, user: this.usersService.toPublic(user) };
  }

  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный номер телефона или пароль');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный номер телефона или пароль');
    }

    const token = this.signToken(user.id, user.phone);
    return { access_token: token, user: this.usersService.toPublic(user) };
  }

  private signToken(userId: number, phone: string): string {
    const payload = { sub: userId, phone, role: 'user' };
    return this.jwtService.sign(payload);
  }
}
