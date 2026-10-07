import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  id: number | string;
  sub?: number | string;
  email?: string;
  role: string;
  userType?: string;
  registry?: string;
  permissions?: string[];
  class?: string;
  section?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        process.env.JWT_SECRET ||
        'sdm_secret_key_2025',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    return payload;
  }
}
