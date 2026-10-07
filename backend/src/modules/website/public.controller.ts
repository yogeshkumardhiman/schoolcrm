import { Controller, Get, Post, Body } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { SettingsService } from '../settings/settings.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public')
export class PublicController {
  constructor(
    private readonly websiteService: WebsiteService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('web-banners')
  @Public()
  async getWebBanners() {
    return this.websiteService.getWebBanners();
  }

  @Get(['banners', 'app-banners'])
  @Public()
  async getAppBanners() {
    return this.websiteService.getAppBanners();
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

  @Get('testimonials')
  @Public()
  async getTestimonials() {
    return this.websiteService.getTestimonials();
  }

  @Get('toppers')
  @Public()
  async getToppers() {
    return this.websiteService.getToppers();
  }

  @Get('school-info')
  @Public()
  async getSchoolInfo() {
    return this.settingsService.getSchoolInfo();
  }

  @Get('settings')
  @Public()
  async getSettings() {
    return this.settingsService.getSchoolSettings();
  }

  @Get('faculty')
  @Public()
  async getFaculty() {
    return this.websiteService.getPublicFaculty();
  }

  @Get('staff')
  @Public()
  async getStaff() {
    return this.websiteService.getPublicFaculty();
  }

  @Post('admissions')
  @Public()
  async submitAdmission(@Body() dto: any) {
    return this.websiteService.submitAdmissionInquiry(dto);
  }

  @Post('contact')
  @Public()
  async submitContact(@Body() dto: any) {
    return this.websiteService.submitContact(dto);
  }

  @Get('fee-structure')
  @Public()
  async getFeeStructure() {
    return this.settingsService.getFeeStructure();
  }

  @Get('transport-routes')
  @Public()
  async getTransportRoutes() {
    return this.settingsService.getTransportRoutes();
  }

  @Get('careers')
  @Public()
  async getCareersConfig() {
    return this.settingsService.getCareersConfig();
  }
}
