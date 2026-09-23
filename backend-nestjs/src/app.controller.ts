import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SettingsService } from './modules/settings/settings.service';
import { WebsiteService } from './modules/website/website.service';
import { AcademicService } from './modules/academic/academic.service';
import { Public } from './common/decorators/public.decorator';
import { CreateNoticeDto } from './modules/website/dto/create-notice.dto';
import { CreateHomeworkDto } from './modules/academic/dto/create-homework.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly settingsService: SettingsService,
    private readonly websiteService: WebsiteService,
    private readonly academicService: AcademicService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('school-info')
  @Public()
  async getSchoolInfo() {
    return this.settingsService.getSchoolInfo();
  }

  @Get('toppers')
  @Public()
  async getToppers() {
    return this.websiteService.getToppers();
  }

  @Get('notices')
  @Public()
  async getNotices() {
    return this.websiteService.getNotices();
  }

  @Get('events')
  @Public()
  async getEvents() {
    return this.websiteService.getEvents();
  }

  @Get('gallery')
  @Public()
  async getGallery() {
    return this.websiteService.getGallery();
  }

  @Get('stats')
  @Public()
  async getStats() {
    const info = await this.settingsService.getSchoolInfo();
    const statsObj = info?.statistics || {};
    return {
      success: true,
      totalStudents: statsObj.totalStudents || 1250,
      totalTeachers: statsObj.totalTeachers || 75,
      classrooms: statsObj.classrooms || 45,
      passPercentage: statsObj.passPercentage || 99,
    };
  }

  @Post(['broadcast', 'admin/broadcast'])
  async broadcastNotice(@Body() dto: CreateNoticeDto) {
    return this.websiteService.createNotice({
      ...dto,
      tag: dto.tag || 'BROADCAST',
      color: dto.color || '#3B82F6',
    });
  }

  @Get('homework')
  async getHomework(
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.academicService.findAllHomework(className, section);
  }

  @Post(['homework', 'admin/homework'])
  async createHomework(@Body() dto: CreateHomeworkDto) {
    return this.academicService.createHomework(dto);
  }
}
