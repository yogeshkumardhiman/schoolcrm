import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permission, RoleType } from '../enums/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Super Admin & Admin bypass rule
    const userRole = String(user.role || '').toUpperCase().replace(/[\s_-]/g, '');
    const userType = String(user.userType || '').toUpperCase().replace(/[\s_-]/g, '');

    if (
      userRole === 'SUPERADMIN' ||
      userRole === 'ADMIN' ||
      userType === 'ADMIN' ||
      userType === 'SUPERADMIN' ||
      user.isSuperAdmin === true ||
      user.role === RoleType.SUPER_ADMIN ||
      user.role === RoleType.ADMIN
    ) {
      return true;
    }

    const userPermissions: string[] = Array.from(
      new Set([
        ...(user.permissions || []),
        ...(userRole === 'CLASSTEACHER' || user.role === RoleType.CLASS_TEACHER
          ? [
              Permission.STUDENT_READ,
              Permission.STUDENT_UPDATE,
              Permission.ATTENDANCE_READ,
              Permission.ATTENDANCE_MARK,
              Permission.ACADEMIC_READ,
              Permission.EXAM_MANAGE,
              Permission.HOMEWORK_MANAGE,
              Permission.TIMETABLE_MANAGE,
              Permission.WEBSITE_READ,
              Permission.REPORT_VIEW,
            ]
          : []),
      ]),
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
