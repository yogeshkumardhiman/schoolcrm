import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { In } from 'typeorm';
import { AppDataSource } from './core/database/data-source';
import { RoleEntity } from './modules/rbac/entities/role.entity';
import { PermissionEntity } from './modules/rbac/entities/permission.entity';
import { UserEntity, UserType } from './modules/auth/entities/user.entity';
import { Permission, RoleType } from './common/enums/permission.enum';

async function seed() {
  console.log('🌱 Starting Database Seeder...');
  await AppDataSource.initialize();
  console.log('✅ Connected to Database');

  const permissionRepository = AppDataSource.getRepository(PermissionEntity);
  const roleRepository = AppDataSource.getRepository(RoleEntity);
  const userRepository = AppDataSource.getRepository(UserEntity);

  // 1. Seed Permissions Matrix
  console.log('📦 Seeding Permissions Matrix...');
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
    const existing = await permissionRepository.findOne({
      where: { code: p.code },
    });
    if (!existing) {
      await permissionRepository.save(permissionRepository.create(p));
    }
  }
  console.log('✅ Permissions matrix verified in database');

  // 2. Seed Super Admin Role
  console.log('👑 Seeding Super Admin Role...');
  const allPermissions = await permissionRepository.find();

  let superAdminRole = await roleRepository.findOne({
    where: { name: RoleType.SUPER_ADMIN },
    relations: { permissions: true },
  });

  if (!superAdminRole) {
    superAdminRole = roleRepository.create({
      name: RoleType.SUPER_ADMIN,
      description: 'Super Administrator with full system access',
      isSystem: true,
      permissions: allPermissions,
    });
  } else {
    superAdminRole.permissions = allPermissions;
  }
  await roleRepository.save(superAdminRole);
  console.log('✅ Super Admin role verified with all permissions');

  // 3. Seed Super Admin User
  console.log('👤 Seeding Initial Super Admin User...');

  if (superAdminRole) {
    const adminIdentifier = 'admin@school.com';
    const existingAdmin = await userRepository.findOne({
      where: [{ loginId: adminIdentifier }, { email: adminIdentifier }],
    });

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const superAdminUser = userRepository.create({
        loginId: adminIdentifier,
        email: adminIdentifier,
        password: hashedPassword,
        userType: UserType.ADMIN,
        roleId: superAdminRole.id as any,
        isActive: true,
      });

      await userRepository.save(superAdminUser);
      console.log(`🚀 Created Super Admin user: ${adminIdentifier} (Password: admin123)`);
    } else {
      // Ensure super admin user has super admin roleId
      existingAdmin.roleId = superAdminRole.id as any;
      await userRepository.save(existingAdmin);
      console.log(`✅ Super Admin user verified: ${adminIdentifier}`);
    }
  }

  console.log('🎉 Seeding Completed Successfully!');
  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeder Failed:', err);
  process.exit(1);
});
