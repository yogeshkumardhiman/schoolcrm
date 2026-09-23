import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class StaffLocalAuthGuard extends AuthGuard('staff-local') {}
