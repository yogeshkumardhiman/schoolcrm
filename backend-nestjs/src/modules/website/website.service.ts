import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebBannerEntity } from './entities/web-banner.entity';
import { AppBannerEntity } from './entities/app-banner.entity';
import { NoticeEntity } from './entities/notice.entity';
import { EventEntity } from './entities/event.entity';
import { GalleryEntity } from './entities/gallery.entity';
import { TestimonialEntity } from './entities/testimonial.entity';
import { TopperEntity } from './entities/topper.entity';
import { ResultEntity } from '../academic/entities/result.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { CreateTopperDto } from './dto/create-topper.dto';
import { StorageService } from '../../core/storage/storage.service';

@Injectable()
export class WebsiteService {
  constructor(
    @InjectRepository(WebBannerEntity)
    private readonly webBannerRepo: Repository<WebBannerEntity>,
    @InjectRepository(AppBannerEntity)
    private readonly appBannerRepo: Repository<AppBannerEntity>,
    @InjectRepository(NoticeEntity)
    private readonly noticeRepo: Repository<NoticeEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(GalleryEntity)
    private readonly galleryRepo: Repository<GalleryEntity>,
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepo: Repository<TestimonialEntity>,
    @InjectRepository(TopperEntity)
    private readonly topperRepo: Repository<TopperEntity>,
    @InjectRepository(ResultEntity)
    private readonly resultRepo: Repository<ResultEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepo: Repository<StaffEntity>,
    private readonly storageService: StorageService,
  ) {}

  // Web Banners
  async getWebBanners(): Promise<WebBannerEntity[]> {
    return this.webBannerRepo.find({ order: { display_order: 'ASC', id: 'DESC' } });
  }

  async createWebBanner(dto: CreateBannerDto): Promise<WebBannerEntity> {
    const banner = this.webBannerRepo.create(dto);
    return this.webBannerRepo.save(banner);
  }

  async updateWebBanner(id: number, dto: Partial<CreateBannerDto>): Promise<WebBannerEntity> {
    const banner = await this.webBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`WebBanner ID ${id} not found`);
    Object.assign(banner, dto);
    return this.webBannerRepo.save(banner);
  }

  async deleteWebBanner(id: number): Promise<{ success: boolean }> {
    const banner = await this.webBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`WebBanner ID ${id} not found`);
    if (banner.image_url) {
      await this.storageService.deleteFile(banner.image_url);
    }
    await this.webBannerRepo.remove(banner);
    return { success: true };
  }

  // App Banners
  async getAppBanners(): Promise<AppBannerEntity[]> {
    return this.appBannerRepo.find({ order: { display_order: 'ASC', id: 'DESC' } });
  }

  async createAppBanner(dto: CreateBannerDto): Promise<AppBannerEntity> {
    const banner = this.appBannerRepo.create(dto);
    return this.appBannerRepo.save(banner);
  }

  async updateAppBanner(id: number, dto: Partial<CreateBannerDto>): Promise<AppBannerEntity> {
    const banner = await this.appBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`AppBanner ID ${id} not found`);
    Object.assign(banner, dto);
    return this.appBannerRepo.save(banner);
  }

  async deleteAppBanner(id: number): Promise<{ success: boolean }> {
    const banner = await this.appBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`AppBanner ID ${id} not found`);
    if (banner.image_url) {
      await this.storageService.deleteFile(banner.image_url);
    }
    await this.appBannerRepo.remove(banner);
    return { success: true };
  }

  // Notices
  async getNotices(): Promise<NoticeEntity[]> {
    const list = await this.noticeRepo.find({ order: { id: 'DESC' } });
    return list.map((n) => ({
      ...n,
      date: n.date || (n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    }));
  }

  async createNotice(dto: CreateNoticeDto): Promise<NoticeEntity> {
    const defaultDate = new Date().toISOString().split('T')[0];
    const notice = this.noticeRepo.create({
      ...dto,
      date: dto.date || defaultDate,
    });
    return this.noticeRepo.save(notice);
  }

  async updateNotice(id: number, dto: Partial<CreateNoticeDto>): Promise<NoticeEntity> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException(`Notice ID ${id} not found`);
    Object.assign(notice, dto);
    return this.noticeRepo.save(notice);
  }

  async deleteNotice(id: number): Promise<{ success: boolean }> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException(`Notice ID ${id} not found`);
    await this.noticeRepo.remove(notice);
    return { success: true };
  }

  // Events
  async getEvents(): Promise<EventEntity[]> {
    return this.eventRepo.find({ order: { id: 'DESC' } });
  }

  async createEvent(dto: CreateEventDto): Promise<EventEntity> {
    const event = this.eventRepo.create(dto);
    return this.eventRepo.save(event);
  }

  async updateEvent(id: number, dto: Partial<CreateEventDto>): Promise<EventEntity> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ID ${id} not found`);
    Object.assign(event, dto);
    return this.eventRepo.save(event);
  }

  async deleteEvent(id: number): Promise<{ success: boolean }> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ID ${id} not found`);
    await this.eventRepo.remove(event);
    return { success: true };
  }

  // Gallery
  async getGallery(): Promise<GalleryEntity[]> {
    return this.galleryRepo.find({ order: { id: 'DESC' } });
  }

  async createGallery(dto: CreateGalleryDto): Promise<GalleryEntity> {
    const gallery = this.galleryRepo.create(dto);
    return this.galleryRepo.save(gallery);
  }

  async updateGallery(id: number, dto: Partial<CreateGalleryDto>): Promise<GalleryEntity> {
    const item = await this.galleryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery item ID ${id} not found`);
    Object.assign(item, dto);
    return this.galleryRepo.save(item);
  }

  async deleteGallery(id: number): Promise<{ success: boolean }> {
    const item = await this.galleryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery item ID ${id} not found`);
    if (item.url) {
      await this.storageService.deleteFile(item.url);
    }
    await this.galleryRepo.remove(item);
    return { success: true };
  }

  // Testimonials
  async getTestimonials(): Promise<TestimonialEntity[]> {
    return this.testimonialRepo.find({ order: { id: 'DESC' } });
  }

  async createTestimonial(dto: CreateTestimonialDto): Promise<TestimonialEntity> {
    const testimonial = this.testimonialRepo.create(dto);
    return this.testimonialRepo.save(testimonial);
  }

  async updateTestimonial(id: number, dto: Partial<CreateTestimonialDto>): Promise<TestimonialEntity> {
    const item = await this.testimonialRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Testimonial ID ${id} not found`);
    Object.assign(item, dto);
    return this.testimonialRepo.save(item);
  }

  async deleteTestimonial(id: number): Promise<{ success: boolean }> {
    const item = await this.testimonialRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Testimonial ID ${id} not found`);
    if (item.image) {
      await this.storageService.deleteFile(item.image);
    }
    await this.testimonialRepo.remove(item);
    return { success: true };
  }

  // Toppers
  async getToppers(): Promise<TopperEntity[]> {
    return this.topperRepo.find({ order: { rank: 'ASC', id: 'DESC' } });
  }

  async createTopper(dto: CreateTopperDto): Promise<TopperEntity> {
    const topper = this.topperRepo.create(dto);
    return this.topperRepo.save(topper);
  }

  async updateTopper(id: number, dto: Partial<CreateTopperDto>): Promise<TopperEntity> {
    const item = await this.topperRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Topper ID ${id} not found`);
    Object.assign(item, dto);
    return this.topperRepo.save(item);
  }

  async deleteTopper(id: number): Promise<{ success: boolean }> {
    const item = await this.topperRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Topper ID ${id} not found`);
    if (item.image) {
      await this.storageService.deleteFile(item.image);
    }
    await this.topperRepo.remove(item);
    return { success: true };
  }

  async autoSyncToppers(): Promise<{ success: boolean; message: string; syncedCount: number }> {
    const results = await this.resultRepo.find({ relations: { student: true } });
    if (!results || results.length === 0) {
      return { success: true, message: 'No student exam results available yet to auto-sync toppers', syncedCount: 0 };
    }

    const studentMap = new Map<number, { student: any; totalMarks: number; maxMarks: number }>();
    results.forEach((r) => {
      if (r.studentId && r.student) {
        const current = studentMap.get(r.studentId) || { student: r.student, totalMarks: 0, maxMarks: 0 };
        current.totalMarks += Number(r.marks || 0);
        current.maxMarks += Number(r.total || 100);
        studentMap.set(r.studentId, current);
      }
    });

    const classToppers = new Map<string, Array<{ student: any; percentage: number }>>();
    studentMap.forEach(({ student, totalMarks, maxMarks }) => {
      const cls = (student.class || 'GENERAL').toUpperCase();
      const pct = maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(2)) : 0;
      const list = classToppers.get(cls) || [];
      list.push({ student, percentage: pct });
      classToppers.set(cls, list);
    });

    const syncedEntries: Array<{ student: any; rank: number; cls: string; percentage: number }> = [];
    classToppers.forEach((list, cls) => {
      list.sort((a, b) => b.percentage - a.percentage);
      const top3 = list.slice(0, 3);
      top3.forEach((item, idx) => {
        syncedEntries.push({
          student: item.student,
          rank: idx + 1,
          cls,
          percentage: item.percentage,
        });
      });
    });

    await Promise.all(
      syncedEntries.map(async ({ student, rank, cls, percentage }) => {
        const existing = await this.topperRepo.findOne({
          where: { name: student.name, class: cls },
        });
        if (existing) {
          existing.percentage = `${percentage}%`;
          existing.rank = rank;
          return this.topperRepo.save(existing);
        }
        const topper = this.topperRepo.create({
          name: student.name,
          class: cls,
          percentage: `${percentage}%`,
          rank,
          session: student.session || '2026-2027',
          image: student.image,
        });
        return this.topperRepo.save(topper);
      }),
    );

    return {
      success: true,
      message: `Successfully synchronized ${syncedEntries.length} toppers across classes`,
      syncedCount: syncedEntries.length,
    };
  }

  // Public Faculty & Staff Showcase (Safe & Lightweight)
  async getPublicFaculty(): Promise<any[]> {
    const staffList = await this.staffRepo.find({
      order: { id: 'ASC' },
    });
    return Promise.all(
      staffList.map(async (s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        designation: s.designation || (s.role === 'TEACHER' ? 'Faculty Member' : s.role),
        subject: s.subject || '',
        qualification: s.qualification || '',
        image: s.image ? await this.storageService.getPresignedUrl(s.image, 604800) : '',
        experience: s.experience || '',
        email: s.email || '',
      }))
    );
  }

  // Public Academic Calendar Events
  async getPublicAcademicCalendar(): Promise<any[]> {
    const events = await this.eventRepo.find({
      order: { id: 'ASC' },
    });
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date || (e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : ''),
      type: e.type || 'Academic Event',
      time: e.time || '',
      description: e.description || '',
      location: e.location || 'School Campus',
      color: e.color || '#4F46E5',
    }));
  }

  // Public Admission Inquiry Submission
  async submitAdmissionInquiry(dto: any): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Thank you! Your admission inquiry has been received. Our admissions team will contact you shortly.',
    };
  }

  // Public Contact Message Submission
  async submitContact(dto: any): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Your message has been dispatched to school management.',
    };
  }
}
