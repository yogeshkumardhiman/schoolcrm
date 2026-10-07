import { Controller, Post, Put, Get, Body, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, DeviceTokenDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: any, @Request() req: any) {
    const identity = dto?.loginId || dto?.email || dto?.identifier || req?.user?.loginId;
    const password = dto?.password;
    const user = req?.user || (await this.authService.validateStaffUser(identity, password));
    if (!user) {
      throw new UnauthorizedException('Authentication Failed: Invalid credentials');
    }
    return this.authService.generateToken(user);
  }

  @Public()
  @Post('student/login')
  async studentLogin(@Body() dto: any, @Request() req: any) {
    const identity = dto?.loginId || dto?.admissionNo || dto?.email || dto?.identifier || req?.user?.loginId;
    const password = dto?.password;
    const student = req?.user || (await this.authService.validateStudentUser(identity, password));
    if (!student) {
      throw new UnauthorizedException('Authentication Failed: Invalid student credentials');
    }
    return this.authService.generateToken(student);
  }

  @Get(['me', 'profile'])
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(Number(user.id), user.role);
  }

  @Post('device-token')
  async updateDeviceToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeviceTokenDto,
  ) {
    return this.authService.updateDeviceToken(Number(user.id), user.role, dto);
  }

  @Put('device-token')
  async updateDeviceTokenPut(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeviceTokenDto,
  ) {
    return this.authService.updateDeviceToken(Number(user.id), user.role, dto);
  }
}
