import { Controller, Post, Body, ValidationPipe, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserAuthService } from './user-auth.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userAuthService: UserAuthService,
  ) {}

  // ─── Admin ───────────────────────────────────────
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('seed-admin')
  async seedAdmin() {
    await this.authService.seedDefaultAdmin();
    return { message: 'Default admin seeded (if not exists)' };
  }

  // ─── User ─────────────────────────────────────────
  @Post('user/register')
  async userRegister(@Body(ValidationPipe) dto: RegisterUserDto) {
    return this.userAuthService.register(dto);
  }

  @Post('user/login')
  async userLogin(@Body(ValidationPipe) dto: LoginUserDto) {
    return this.userAuthService.login(dto);
  }
}
