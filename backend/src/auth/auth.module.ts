import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthService } from './user-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { AdminUser } from '../entities/admin-user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserAuthService, JwtStrategy, UserJwtStrategy],
  exports: [AuthService, UserAuthService, JwtStrategy, UserJwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
