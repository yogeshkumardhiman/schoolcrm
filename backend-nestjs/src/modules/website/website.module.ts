import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebBannerEntity } from './entities/web-banner.entity';
import { AppBannerEntity } from './entities/app-banner.entity';
import { NoticeEntity } from './entities/notice.entity';
import { EventEntity } from './entities/event.entity';
import { GalleryEntity } from './entities/gallery.entity';
import { TestimonialEntity } from './entities/testimonial.entity';
import { TopperEntity } from './entities/topper.entity';
import { ResultEntity } from '../academic/entities/result.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { SettingsModule } from '../settings/settings.module';
import { AcademicModule } from '../academic/academic.module';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';
import { PublicController } from './public.controller';

@Module({
  imports: [
    SettingsModule,
    forwardRef(() => AcademicModule),
    TypeOrmModule.forFeature([
      WebBannerEntity,
      AppBannerEntity,
      NoticeEntity,
      EventEntity,
      GalleryEntity,
      TestimonialEntity,
      TopperEntity,
      ResultEntity,
      StaffEntity,
    ]),
  ],
  controllers: [WebsiteController, PublicController],
  providers: [WebsiteService],
  exports: [WebsiteService, TypeOrmModule],
})
export class WebsiteModule {}
