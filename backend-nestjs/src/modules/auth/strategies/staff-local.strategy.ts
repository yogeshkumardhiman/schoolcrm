import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class StaffLocalStrategy extends PassportStrategy(Strategy, 'staff-local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginId',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options?: any) {
    if (req.body) {
      const identity = req.body.loginId || req.body.email || req.body.identifier;
      if (identity) {
        req.body.loginId = identity;
      }
    }
    super.authenticate(req, options);
  }

  async validate(req: any, loginId: string, password: string): Promise<any> {
    const identity = loginId || req.body?.email || req.body?.identifier;
    const user = await this.authService.validateStaffUser(identity, password);
    if (!user) {
      throw new UnauthorizedException('Authentication Failed: Invalid credentials');
    }
    return user;
  }
}
