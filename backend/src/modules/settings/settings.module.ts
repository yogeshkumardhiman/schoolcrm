import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolInfoEntity } from './entities/school-info.entity';
import { SchoolSettingsEntity } from './entities/school-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolInfoEntity, SchoolSettingsEntity]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService, TypeOrmModule],
})
export class SettingsModule {}
