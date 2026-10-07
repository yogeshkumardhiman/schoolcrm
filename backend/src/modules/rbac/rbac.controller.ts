import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async getRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermissions(Permission.RBAC_PERMISSION_ASSIGN)
  async getPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('roles')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async createRole(
    @Body() body: { name: string; description: string; permissions: string[] },
  ) {
    return this.rbacService.createRole(body.name, body.description, body.permissions || []);
  }

  @Put('roles/:id')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name: string; description: string; permissions?: string[] },
  ) {
    return this.rbacService.updateRole(
      id,
      body.name,
      body.description,
      body.permissions,
    );
  }

  @Delete('roles/:id')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // --- ADMIN USERS ---

  @Get('admins')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async getAdmins() {
    return this.rbacService.getAdminUsers();
  }

  @Post('admins')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async createAdmin(
    @Body()
    body: {
      email: string;
      loginId?: string;
      password?: string;
      roleId?: string;
    },
  ) {
    return this.rbacService.createAdminUser(body);
  }

  @Put('admins/:id')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async updateAdmin(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; roleId?: string },
  ) {
    return this.rbacService.updateAdminUser(parseInt(id, 10), body);
  }

  @Delete('admins/:id')
  @RequirePermissions(Permission.RBAC_ROLE_MANAGE)
  async deleteAdmin(@Param('id') id: string) {
    return this.rbacService.deleteAdminUser(parseInt(id, 10));
  }
}
