import {
  Controller,
  Post,
  Get,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from '../../core/storage/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Public()
  async uploadFile(
    @Req() req: any,
    @Query('type') typeQuery?: string,
    @Query('folder') folderQuery?: string,
    @Query('loginId') loginIdQuery?: string,
    @Query('category') categoryQuery?: string,
  ) {
    if (typeof req.isMultipart === 'function' && !req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    const data = typeof req.file === 'function' ? await req.file() : null;
    if (!data) {
      throw new BadRequestException('No file detected in upload request.');
    }

    let folder = folderQuery || typeQuery;
    if (!folder) {
      if (loginIdQuery) {
        const category = categoryQuery || 'documents';
        folder = `staff/${loginIdQuery.toUpperCase()}/${category}`;
      } else {
        folder = 'staff/documents';
      }
    }

    const buffer = await data.toBuffer();

    const url = await this.storageService.uploadFile(
      buffer,
      data.filename,
      data.mimetype,
      folder,
    );

    return {
      url,
      filename: data.filename,
      mimetype: data.mimetype,
    };
  }

  @Post('crm/upload')
  @Public()
  async crmUploadFile(@Req() req: any, @Query('type') typeQuery?: string) {
    return this.uploadFile(req, typeQuery);
  }

  @Post('admin/upload')
  @Public()
  async adminUploadFile(@Req() req: any, @Query('type') typeQuery?: string) {
    return this.uploadFile(req, typeQuery);
  }

  @Get('upload/signed-url')
  @Public()
  async getSignedUrl(
    @Query('key') key?: string,
    @Query('url') url?: string,
    @Query('expiresIn') expiresInQuery?: string,
  ) {
    const target = key || url;
    if (!target) {
      throw new BadRequestException('Query parameter "key" or "url" is required.');
    }

    const expiresIn = Number(expiresInQuery) || 86400; // 24 hours default
    const signedUrl = await this.storageService.getPresignedUrl(target, expiresIn);
    return { signedUrl };
  }

  @Get('crm/upload/signed-url')
  @Public()
  async crmGetSignedUrl(
    @Query('key') key?: string,
    @Query('url') url?: string,
    @Query('expiresIn') expiresInQuery?: string,
  ) {
    return this.getSignedUrl(key, url, expiresInQuery);
  }
}
