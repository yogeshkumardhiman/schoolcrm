import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolInfoEntity } from './entities/school-info.entity';
import { SchoolSettingsEntity } from './entities/school-settings.entity';
import { UpdateSchoolInfoDto } from './dto/update-school-info.dto';
import { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';
import { StorageService } from '../../core/storage/storage.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepo: Repository<SchoolInfoEntity>,
    @InjectRepository(SchoolSettingsEntity)
    private readonly schoolSettingsRepo: Repository<SchoolSettingsEntity>,
    private readonly storageService: StorageService,
  ) {}

  async getSchoolInfo(): Promise<SchoolInfoEntity> {
    const infos = await this.schoolInfoRepo.find({ take: 1 });
    const info = infos.length > 0 ? infos[0] : this.schoolInfoRepo.create({});

    // Fallbacks if not explicitly set in database
    if (!info.schoolName && process.env.SCHOOL_NAME) {
      info.schoolName = process.env.SCHOOL_NAME;
    }
    if (!info.aboutTitle && process.env.SCHOOL_TAGLINE) {
      info.aboutTitle = process.env.SCHOOL_TAGLINE;
    }
    if (!info.address && process.env.SCHOOL_ADDRESS) {
      info.address = process.env.SCHOOL_ADDRESS;
    }
    if (!info.contactPhone && process.env.SCHOOL_PHONE) {
      info.contactPhone = process.env.SCHOOL_PHONE;
    }
    if (!info.contactEmail && process.env.SCHOOL_EMAIL) {
      info.contactEmail = process.env.SCHOOL_EMAIL;
    }

    if (info.logoImage) {
      info.logoImage = await this.storageService.getPresignedUrl(info.logoImage, 604800);
    }
    if (info.bannerImage) {
      info.bannerImage = await this.storageService.getPresignedUrl(info.bannerImage, 604800);
    }
    if (info.principalImage) {
      info.principalImage = await this.storageService.getPresignedUrl(info.principalImage, 604800);
    }
    if (info.about_config && typeof info.about_config === 'object') {
      if ((info.about_config as any).principalImage) {
        (info.about_config as any).principalImage = await this.storageService.getPresignedUrl(
          (info.about_config as any).principalImage,
          604800,
        );
      }
    }

    return info;
  }

  async updateSchoolInfo(dto: UpdateSchoolInfoDto): Promise<SchoolInfoEntity> {
    const infos = await this.schoolInfoRepo.find({ take: 1 });
    const info = infos.length > 0 ? infos[0] : this.schoolInfoRepo.create({});
    Object.assign(info, dto);
    const saved = await this.schoolInfoRepo.save(info);

    if (saved.logoImage) {
      saved.logoImage = await this.storageService.getPresignedUrl(saved.logoImage, 604800);
    }
    if (saved.principalImage) {
      saved.principalImage = await this.storageService.getPresignedUrl(saved.principalImage, 604800);
    }
    return saved;
  }

  async getSchoolSettings(): Promise<any> {
    const settingsList = await this.schoolSettingsRepo.find({ take: 1 });
    const settings = settingsList.length > 0 ? settingsList[0] : await this.schoolSettingsRepo.save(this.schoolSettingsRepo.create({}));
    const info = await this.getSchoolInfo();

    const finalSchoolName = settings.school_name || info.schoolName || 'RANI PUBLIC SCHOOL';
    const finalAppTitle = settings.app_title || 'RP SCHOOL';
    let finalLogoUrl = settings.logo_url || info.logoImage || null;

    if (finalLogoUrl) {
      finalLogoUrl = await this.storageService.getPresignedUrl(finalLogoUrl, 604800);
    }

    return {
      ...settings,
      school_name: finalSchoolName,
      schoolName: finalSchoolName,
      app_title: finalAppTitle,
      appTitle: finalAppTitle,
      logo_url: finalLogoUrl,
      logoUrl: finalLogoUrl,
      logoImage: finalLogoUrl,
      primary_color: settings.primary_color || info.primaryColor || '#6C63FF',
      primaryColor: settings.primary_color || info.primaryColor || '#6C63FF',
      secondary_color: settings.secondary_color || info.secondaryColor || '#8B5CF6',
      secondaryColor: settings.secondary_color || info.secondaryColor || '#8B5CF6',
    };
  }

  async updateSchoolSettings(
    dto: UpdateSchoolSettingsDto,
  ): Promise<any> {
    const settingsList = await this.schoolSettingsRepo.find({ take: 1 });
    const settings = settingsList.length > 0 ? settingsList[0] : this.schoolSettingsRepo.create({});
    Object.assign(settings, dto);
    await this.schoolSettingsRepo.save(settings);
    return this.getSchoolSettings();
  }

  async getFeeStructure(): Promise<any> {
    const info = await this.getSchoolInfo();
    const config = info.fee_structure_config || {};
    const defaultFeeTiers = [
      {
        id: 1,
        wing: "Pre-Primary Wing",
        classes: "Nursery, LKG & UKG",
        quarterlyFee: "₹5,400",
        monthlyEquiv: "₹1,800 / month",
        highlights: ["Activity & Phonics Kit", "Smart Kindergarten Lab", "Indoor Play Arena", "Term Assessments Included"]
      },
      {
        id: 2,
        wing: "Primary Wing",
        classes: "Classes I to V",
        quarterlyFee: "₹6,600",
        monthlyEquiv: "₹2,200 / month",
        highlights: ["Experiential STEM Labs", "Junior Computer Labs", "Co-Curricular Clubs", "Library & Sports Access"]
      },
      {
        id: 3,
        wing: "Middle & Secondary",
        classes: "Classes VI to X",
        quarterlyFee: "₹8,400",
        monthlyEquiv: "₹2,800 / month",
        highlights: ["Science Composite Labs", "Python AI Robotics", "CBSE Registration Support", "Inter-School Sports Coaching"]
      },
      {
        id: 4,
        wing: "Senior Secondary",
        classes: "Classes XI & XII (All Streams)",
        quarterlyFee: "₹10,500",
        monthlyEquiv: "₹3,500 / month",
        highlights: ["Specialized PCB/PCM Labs", "Commerce & Computer Science", "Pre-Board Assessments", "Competitive Entrance Guidance"]
      }
    ];

    return {
      showFeeStructure: config.showFeeStructure ?? true,
      sessionTag: config.sessionTag || "SESSION 2026-27",
      accountsPhone: config.accountsPhone || info.contactPhone || "+91 9761839857",
      accountsEmail: config.accountsEmail || info.contactEmail || "accounts@school.in",
      bankDetails: config.bankDetails || {
        bankName: "State Bank of India (SBI)",
        accountName: info.schoolName || "School Account",
        accountNumber: "389201928392",
        ifscCode: "SBIN0001234",
        upiId: "school@sbi"
      },
      feeTiers: (Array.isArray(config.feeTiers) && config.feeTiers.length > 0) ? config.feeTiers : defaultFeeTiers
    };
  }

  async getTransportRoutes(): Promise<any> {
    const info = await this.getSchoolInfo();
    const config = info.fee_structure_config || {};
    const defaultRoutes = [
      {
        id: 1,
        routeName: "Route A — Local City Limits",
        distanceSlab: "0 – 5 km",
        monthlyFee: "₹800 / month",
        pickupPoints: "Civil Lines, Main Chowk, Station Road, Collectorate Colony",
        vehicleType: "Air-Cooled CCTV Bus"
      },
      {
        id: 2,
        routeName: "Route B — Highway & Sector Belt",
        distanceSlab: "5 – 10 km",
        monthlyFee: "₹1,200 / month",
        pickupPoints: "Main Gate, Sugar Mill Square, Market Crossing",
        vehicleType: "GPS Monitored Mini-Bus"
      },
      {
        id: 3,
        routeName: "Route C — Sector & Town Crossing",
        distanceSlab: "10 – 15 km",
        monthlyFee: "₹1,500 / month",
        pickupPoints: "Highway Crossing, Main Village Post, Police Sector",
        vehicleType: "Standard 42-Seater Bus"
      },
      {
        id: 4,
        routeName: "Route D — Outer Regional Belt",
        distanceSlab: "15 – 22 km",
        monthlyFee: "₹1,800 / month",
        pickupPoints: "Link Road, Outer Bypass, Green Enclave",
        vehicleType: "Dedicated School Bus"
      }
    ];

    return {
      showTransportSlabs: config.showTransportSlabs ?? true,
      transportRoutes: (Array.isArray(config.transportRoutes) && config.transportRoutes.length > 0) ? config.transportRoutes : defaultRoutes
    };
  }

  async getCareersConfig(): Promise<any> {
    const info = await this.getSchoolInfo();
    const config = info.careers_config || {};

    return {
      jobs: Array.isArray(config.jobs) ? config.jobs : [],
      hrConfig: config.hrConfig || {
        sessionTag: "FACULTY RECRUITMENT • ACADEMIC SESSION 2026-27",
        headline: "Shape the Future of Tomorrow's Leaders",
        subheadline: "Join our dynamic fraternity of educators and mentors dedicated to CBSE excellence.",
        hrPhone: info.contactPhone || "+91 9761839857",
        hrEmail: info.contactEmail || "careers@school.in",
        walkinTimings: "Mon – Sat (10:00 AM – 2:00 PM)"
      }
    };
  }
}
