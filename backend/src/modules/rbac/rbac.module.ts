import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService, TypeOrmModule],
})
export class RbacModule {}
