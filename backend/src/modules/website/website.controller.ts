import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WebsiteService } from './website.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { CreateTopperDto } from './dto/create-topper.dto';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  // Web Banners
  @Get('web-banners')
  @Public()
  async getWebBanners() {
    return this.websiteService.getWebBanners();
  }

  @Post('web-banners')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createWebBanner(@Body() dto: CreateBannerDto) {
    return this.websiteService.createWebBanner(dto);
  }

  @Put('web-banners/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateWebBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateBannerDto>,
  ) {
    return this.websiteService.updateWebBanner(id, dto);
  }

  @Delete('web-banners/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteWebBanner(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteWebBanner(id);
  }

  // App Banners
  @Get('app-banners')
  @Public()
  async getAppBanners() {
    return this.websiteService.getAppBanners();
  }

  @Post('app-banners')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createAppBanner(@Body() dto: CreateBannerDto) {
    return this.websiteService.createAppBanner(dto);
  }

  @Put('app-banners/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateAppBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateBannerDto>,
  ) {
    return this.websiteService.updateAppBanner(id, dto);
  }

  @Delete('app-banners/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteAppBanner(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteAppBanner(id);
  }

  // Notices
  @Get('notices')
  @Public()
  async getNotices() {
    return this.websiteService.getNotices();
  }

  @Post('notices')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createNotice(@Body() dto: CreateNoticeDto) {
    return this.websiteService.createNotice(dto);
  }

  @Put('notices/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateNoticeDto>,
  ) {
    return this.websiteService.updateNotice(id, dto);
  }

  @Delete('notices/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteNotice(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteNotice(id);
  }

  // Events
  @Get('events')
  @Public()
  async getEvents() {
    return this.websiteService.getEvents();
  }

  @Post('events')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createEvent(@Body() dto: CreateEventDto) {
    return this.websiteService.createEvent(dto);
  }

  @Put('events/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateEventDto>,
  ) {
    return this.websiteService.updateEvent(id, dto);
  }

  @Delete('events/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteEvent(id);
  }

  // Gallery
  @Get('gallery')
  @Get('galleries')
  @Public()
  async getGallery() {
    return this.websiteService.getGallery();
  }

  @Post('gallery')
  @Post('galleries')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createGallery(@Body() dto: CreateGalleryDto) {
    return this.websiteService.createGallery(dto);
  }

  @Put('gallery/:id')
  @Put('galleries/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateGallery(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateGalleryDto>,
  ) {
    return this.websiteService.updateGallery(id, dto);
  }

  @Delete('gallery/:id')
  @Delete('galleries/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteGallery(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteGallery(id);
  }

  // Testimonials
  @Get('testimonials')
  @Public()
  async getTestimonials() {
    return this.websiteService.getTestimonials();
  }

  @Post('testimonials')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createTestimonial(@Body() dto: CreateTestimonialDto) {
    return this.websiteService.createTestimonial(dto);
  }

  @Put('testimonials/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTestimonialDto>,
  ) {
    return this.websiteService.updateTestimonial(id, dto);
  }

  @Delete('testimonials/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteTestimonial(id);
  }

  // Toppers
  @Get('toppers')
  @Public()
  async getToppers() {
    return this.websiteService.getToppers();
  }

  @Post('toppers')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async createTopper(@Body() dto: CreateTopperDto) {
    return this.websiteService.createTopper(dto);
  }

  @Put('toppers/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async updateTopper(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTopperDto>,
  ) {
    return this.websiteService.updateTopper(id, dto);
  }

  @Delete('toppers/:id')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async deleteTopper(@Param('id', ParseIntPipe) id: number) {
    return this.websiteService.deleteTopper(id);
  }

  @Post('toppers/auto-sync')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async autoSyncToppers() {
    return this.websiteService.autoSyncToppers();
  }

  @Post('admin/toppers/auto-sync')
  @RequirePermissions(Permission.WEBSITE_MANAGE)
  async autoSyncToppersAlias() {
    return this.websiteService.autoSyncToppers();
  }

  // Public Faculty & Teachers List
  @Get('faculty')
  @Public()
  async getPublicFaculty() {
    return this.websiteService.getPublicFaculty();
  }

  // Public Academic Calendar
  @Get('academic-calendar')
  @Public()
  async getPublicAcademicCalendar() {
    return this.websiteService.getPublicAcademicCalendar();
  }

  // Public Admission Inquiry Submission
  @Post('admission-inquiry')
  @Public()
  async submitAdmissionInquiry(@Body() dto: any) {
    return this.websiteService.submitAdmissionInquiry(dto);
  }

  // Public Contact Message Submission
  @Post('contact')
  @Public()
  async submitContact(@Body() dto: any) {
    return this.websiteService.submitContact(dto);
  }
}
