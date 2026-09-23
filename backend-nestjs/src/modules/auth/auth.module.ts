import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StaffEntity } from '../staff/entities/staff.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { UserEntity } from './entities/user.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StaffLocalStrategy } from './strategies/staff-local.strategy';
import { StudentLocalStrategy } from './strategies/student-local.strategy';
import { StaffLocalAuthGuard } from './guards/staff-local-auth.guard';
import { StudentLocalAuthGuard } from './guards/student-local-auth.guard';

import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      StaffEntity,
      StudentEntity,
      ActivityLogEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'sdm_secret_key_2025',
        signOptions: { expiresIn: '365d' },
      }),
    }),
    RbacModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    StaffLocalStrategy,
    StudentLocalStrategy,
    StaffLocalAuthGuard,
    StudentLocalAuthGuard,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    StaffLocalStrategy,
    StudentLocalStrategy,
    StaffLocalAuthGuard,
    StudentLocalAuthGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
