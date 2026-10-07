import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserEntity, UserType } from '../auth/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Permission, RoleType } from '../../common/enums/permission.enum';

@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    await this.ensurePermissionsAndSystemRoles();
  }

  async ensurePermissionsAndSystemRoles() {
    try {
      const permissionEntries = Object.values(Permission).map((code) => {
        const [moduleName, action] = code.split(':');
        return {
          code,
          name: `${moduleName.toUpperCase()} ${action.toUpperCase()}`,
          module: moduleName.toLowerCase(),
          description: `Allows ${action} action on ${moduleName}`,
        };
      });

      for (const p of permissionEntries) {
        const existing = await this.permissionRepository.findOne({
          where: { code: p.code },
        });
        if (!existing) {
          await this.permissionRepository.save(
            this.permissionRepository.create(p),
          );
        }
      }

      const allPermissions = await this.permissionRepository.find();
      const permMap = new Map<string, PermissionEntity>();
      allPermissions.forEach((p) => permMap.set(p.code, p));

      const getPerms = (codes: string[]) =>
        codes
          .map((code) => permMap.get(code))
          .filter((p): p is PermissionEntity => Boolean(p));

      // System Roles Definition Matrix (7 Core Institutional Roles)
      const systemRolesConfig: {
        name: string;
        description: string;
        permissionCodes: string[];
      }[] = [
        {
          name: RoleType.SUPER_ADMIN,
          description: 'Institutional Super Administrator with unrestricted root access',
          permissionCodes: Object.values(Permission),
        },
        {
          name: RoleType.ADMIN,
          description: 'School Administrator with institutional operations management',
          permissionCodes: Object.values(Permission),
        },
        {
          name: RoleType.PRINCIPAL,
          description: 'School Principal with academic governance, faculty supervision & student oversight',
          permissionCodes: [
            Permission.STUDENT_READ,
            Permission.STUDENT_CREATE,
            Permission.STUDENT_UPDATE,
            Permission.STUDENT_DELETE,
            Permission.STAFF_READ,
            Permission.STAFF_CREATE,
            Permission.STAFF_UPDATE,
            Permission.STAFF_ATTENDANCE_MANAGE,
            Permission.STAFF_LEAVE_MANAGE,
            Permission.SUBSTITUTION_MANAGE,
            Permission.ATTENDANCE_READ,
            Permission.ATTENDANCE_MARK,
            Permission.ATTENDANCE_REPORT,
            Permission.FEE_READ,
            Permission.FEE_REPORT,
            Permission.SALARY_READ,
            Permission.TRANSPORT_READ,
            Permission.ACADEMIC_READ,
            Permission.ACADEMIC_MANAGE,
            Permission.EXAM_MANAGE,
            Permission.HOMEWORK_MANAGE,
            Permission.TIMETABLE_MANAGE,
            Permission.CALENDAR_MANAGE,
            Permission.WEBSITE_READ,
            Permission.WEBSITE_MANAGE,
            Permission.APP_MANAGE,
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT,
          ],
        },
        {
          name: RoleType.VICE_PRINCIPAL,
          description: 'Vice Principal with academic management, faculty supervision & examination oversight',
          permissionCodes: [
            Permission.STUDENT_READ,
            Permission.STUDENT_UPDATE,
            Permission.STAFF_READ,
            Permission.STAFF_UPDATE,
            Permission.STAFF_ATTENDANCE_MANAGE,
            Permission.STAFF_LEAVE_MANAGE,
            Permission.SUBSTITUTION_MANAGE,
            Permission.ATTENDANCE_READ,
            Permission.ATTENDANCE_MARK,
            Permission.ATTENDANCE_REPORT,
            Permission.ACADEMIC_READ,
            Permission.ACADEMIC_MANAGE,
            Permission.EXAM_MANAGE,
            Permission.HOMEWORK_MANAGE,
            Permission.TIMETABLE_MANAGE,
            Permission.CALENDAR_MANAGE,
            Permission.WEBSITE_READ,
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT,
          ],
        },
        {
          name: RoleType.ACCOUNTANT,
          description: 'Finance Officer for Fee Invoicing, Collections, Salary & Transport',
          permissionCodes: [
            Permission.STUDENT_READ,
            Permission.STAFF_READ,
            Permission.FEE_READ,
            Permission.FEE_STRUCTURE_MANAGE,
            Permission.FEE_ASSIGN,
            Permission.FEE_COLLECT,
            Permission.FEE_REPORT,
            Permission.SALARY_READ,
            Permission.SALARY_STRUCTURE_MANAGE,
            Permission.SALARY_PAY,
            Permission.TRANSPORT_READ,
            Permission.TRANSPORT_MANAGE,
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT,
          ],
        },
        {
          name: RoleType.CLASS_TEACHER,
          description: 'Class Teacher with assigned class roster ownership, student attendance & homework',
          permissionCodes: [
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
          ],
        },
        {
          name: RoleType.TEACHER,
          description: 'Subject Teacher with curriculum delivery, marks entry & daily homework',
          permissionCodes: [
            Permission.ACADEMIC_READ,
            Permission.EXAM_MANAGE,
            Permission.HOMEWORK_MANAGE,
            Permission.TIMETABLE_MANAGE,
            Permission.WEBSITE_READ,
          ],
        },
      ];

      for (const config of systemRolesConfig) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: config.name },
          relations: { permissions: true },
        });

        const targetPermissions = getPerms(config.permissionCodes);

        if (!existingRole) {
          const newRole = this.roleRepository.create({
            name: config.name,
            description: config.description,
            isSystem: true,
            permissions: targetPermissions,
          });
          await this.roleRepository.save(newRole);
        } else {
          existingRole.description = config.description;
          existingRole.isSystem = true;
          existingRole.permissions = targetPermissions;
          await this.roleRepository.save(existingRole);
        }
      }

      this.logger.log('Permissions matrix and institutional roles synced successfully');
    } catch (err) {
      this.logger.error('Failed to auto-sync permissions matrix:', err);
    }
  }

  async getAllRoles(): Promise<RoleEntity[]> {
    const roles = await this.roleRepository.find({
      relations: { permissions: true },
    });

    const HIERARCHY_ORDER: Record<string, number> = {
      SUPER_ADMIN: 1,
      ADMIN: 2,
      PRINCIPAL: 3,
      VICE_PRINCIPAL: 4,
      ACCOUNTANT: 5,
      CLASS_TEACHER: 6,
      TEACHER: 7,
    };

    return roles.sort((a, b) => {
      const orderA = HIERARCHY_ORDER[a.name] ?? 99;
      const orderB = HIERARCHY_ORDER[b.name] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find();
  }

  async createRole(name: string, description: string, permissionCodes: string[]): Promise<RoleEntity> {
    const permissions = await this.permissionRepository.find({
      where: { code: In(permissionCodes) },
    });

    const role = this.roleRepository.create({
      name,
      description,
      isSystem: false,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async assignPermissionsToRole(roleId: string, permissionCodes: string[]): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const permissions = await this.permissionRepository.find({
      where: { code: In(permissionCodes) },
    });

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async updateRole(
    roleId: string,
    name: string,
    description: string,
    permissionCodes?: string[],
  ): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: { permissions: true },
    });
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;

    if (permissionCodes && Array.isArray(permissionCodes)) {
      const permissions = await this.permissionRepository.find({
        where: { code: In(permissionCodes) },
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(
    roleId: string,
  ): Promise<{ success: boolean; message: string }> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    if (role.name === 'SUPER_ADMIN') {
      throw new BadRequestException('SUPER_ADMIN role cannot be deleted.');
    }

    // Unlink role from users if assigned
    await this.userRepository.update({ roleId }, { roleId: undefined });

    await this.roleRepository.remove(role);
    return { success: true, message: `Role ${role.name} deleted successfully` };
  }

  // --- SUPER ADMIN / ADMINISTRATOR USER MANAGEMENT ---

  async getAdminUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: [{ userType: UserType.ADMIN }],
      relations: { dynamicRole: true },
      order: { id: 'ASC' },
    });
  }

  async createAdminUser(data: {
    email: string;
    loginId?: string;
    password?: string;
    roleId?: string;
  }): Promise<any> {
    const email = data.email.trim().toLowerCase();
    const existing = await this.userRepository.findOne({
      where: [{ email }],
    });
    if (existing) {
      throw new ConflictException(`User with email "${email}" already exists.`);
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const schoolPrefix = (
      process.env.SCHOOL_NAME?.replace(/[^a-zA-Z]/g, '').substring(0, 3) || 'ADM'
    ).toUpperCase();
    const loginId =
      data.loginId?.trim().toUpperCase() || `${schoolPrefix}${year}ADM${randomNum}`;

    const plainPassword = data.password || 'admin123';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    // Find Super Admin Role if roleId not provided
    let roleId = data.roleId;
    if (!roleId) {
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'SUPER_ADMIN' },
      });
      if (superAdminRole) {
        roleId = superAdminRole.id;
      }
    }

    const user = this.userRepository.create({
      loginId,
      email,
      password: hashedPassword,
      userType: UserType.ADMIN,
      roleId,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

    // Dispatch email
    this.mailService
      .sendFacultyCredentials({
        to: email,
        loginId,
        name: 'Administrator',
        password: plainPassword,
        role: 'SUPER_ADMIN',
        designation: 'Institutional Super Administrator',
      })
      .catch((err) => {
        this.logger.error('Failed to send admin credentials email:', err);
      });

    const { password, ...safeUser } = savedUser;
    return {
      ...safeUser,
      loginId,
      message:
        'Super Admin user created successfully and credentials dispatched to email.',
    };
  }

  async updateAdminUser(
    id: number,
    data: { isActive?: boolean; roleId?: string },
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (data.isActive !== undefined) user.isActive = data.isActive;
    if (data.roleId) user.roleId = data.roleId;
    return this.userRepository.save(user);
  }

  async deleteAdminUser(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.email === 'admin@school.com') {
      throw new BadRequestException(
        'Primary root Super Admin user cannot be deleted.',
      );
    }
    await this.userRepository.remove(user);
    return {
      success: true,
      message: `Admin user ${user.loginId} deleted successfully`,
    };
  }
}
