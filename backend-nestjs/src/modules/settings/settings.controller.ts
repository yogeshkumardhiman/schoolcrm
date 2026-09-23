import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSchoolInfoDto } from './dto/update-school-info.dto';
import { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('school-info')
  @Public()
  async getSchoolInfo() {
    return this.settingsService.getSchoolInfo();
  }

  @Post('school-info')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateSchoolInfo(@Body() dto: UpdateSchoolInfoDto) {
    return this.settingsService.updateSchoolInfo(dto);
  }

  @Put('school-info')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateSchoolInfoPut(@Body() dto: UpdateSchoolInfoDto) {
    return this.settingsService.updateSchoolInfo(dto);
  }

  @Get('config')
  @Public()
  async getSettingsConfig() {
    return this.settingsService.getSchoolSettings();
  }

  @Put('config')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateSettingsConfig(@Body() dto: UpdateSchoolSettingsDto) {
    return this.settingsService.updateSchoolSettings(dto);
  }

  // Backward compatible mobile settings endpoints
  @Get('mobile')
  @Public()
  async getMobileSettings() {
    return this.settingsService.getSchoolSettings();
  }

  @Put('mobile')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateMobileSettings(@Body() dto: UpdateSchoolSettingsDto) {
    return this.settingsService.updateSchoolSettings(dto);
  }

  @Post('mobile')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateMobileSettingsPost(@Body() dto: UpdateSchoolSettingsDto) {
    return this.settingsService.updateSchoolSettings(dto);
  }
}
