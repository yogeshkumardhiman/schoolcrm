import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly useS3: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.get<string>('PORT')) || 4000;
    this.baseUrl =
      this.configService.get<string>('APP_URL') || `http://127.0.0.1:${port}`;
    this.uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('S3_SECRET_ACCESS_KEY');
    this.bucketName =
      this.configService.get<string>('S3_BUCKET_NAME') || 'school';
    const customPublicDomain =
      this.configService.get<string>('S3_PUBLIC_DOMAIN');

    if (accessKeyId && secretAccessKey && endpoint) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true,
      });

      if (customPublicDomain) {
        this.publicDomain = customPublicDomain.endsWith('/')
          ? customPublicDomain.slice(0, -1)
          : customPublicDomain;
      } else {
        const cleanEndpoint = endpoint.endsWith('/')
          ? endpoint.slice(0, -1)
          : endpoint;
        this.publicDomain = `${cleanEndpoint}/${this.bucketName}`;
      }

      this.useS3 = true;
      this.logger.log(
        `Cloudflare R2 / S3 Storage enabled (Bucket: ${this.bucketName})`,
      );
    } else {
      this.logger.log(`Local Server Storage enabled at: ${this.uploadDir}`);
    }
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder = 'staff/documents',
  ): Promise<string> {
    const sanitizedName = fileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');
    const key = `${folder}/${Date.now()}-${sanitizedName}`;

    // 1. Upload to S3 / Cloudflare R2 if configured
    if (this.useS3 && this.s3Client) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
          }),
        );

        // Generate Signed GET URL (valid for 7 days / 604800 seconds) for private access
        const presignedUrl = await getSignedUrl(
          this.s3Client,
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
          { expiresIn: 604800 },
        );

        this.logger.log(`Uploaded file to S3/R2 with signed URL: ${key}`);
        return presignedUrl;
      } catch (err: any) {
        this.logger.error(
          `S3/R2 Upload Failed for ${fileName}: ${err.message}. Falling back to local storage.`,
        );
      }
    }

    // 2. Fallback to Local Server Storage
    const targetFolder = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(targetFolder, uniqueFileName);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `${this.baseUrl}/uploads/${folder}/${uniqueFileName}`;
    this.logger.log(`Stored file on local server: ${fileUrl}`);
    return fileUrl;
  }

  /**
   * Generates a Presigned GET URL for a private S3 key or existing URL
   * Default validity: 24 hours (86,400 seconds)
   */
  async getPresignedUrl(
    fileUrlOrKey: string,
    expiresInSeconds = 86400,
  ): Promise<string> {
    if (!fileUrlOrKey) return '';
    if (!this.useS3 || !this.s3Client) return fileUrlOrKey;

    let key = fileUrlOrKey;
    if (
      fileUrlOrKey.startsWith('http://') ||
      fileUrlOrKey.startsWith('https://')
    ) {
      try {
        const urlObj = new URL(fileUrlOrKey);
        // Strip bucket name or query params if any
        let pathname = urlObj.pathname;
        if (pathname.startsWith(`/${this.bucketName}/`)) {
          pathname = pathname.replace(`/${this.bucketName}/`, '');
        } else if (pathname.startsWith('/')) {
          pathname = pathname.slice(1);
        }
        key = pathname;
      } catch {
        key = fileUrlOrKey;
      }
    }

    try {
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
        { expiresIn: expiresInSeconds },
      );
      return signedUrl;
    } catch (err: any) {
      this.logger.warn(`Failed to generate signed URL for ${key}: ${err.message}`);
      return fileUrlOrKey;
    }
  }

  async deleteFile(fileUrlOrKey: string): Promise<boolean> {
    if (!fileUrlOrKey) return false;

    if (this.useS3 && this.s3Client) {
      let key = fileUrlOrKey;
      if (
        fileUrlOrKey.startsWith('http://') ||
        fileUrlOrKey.startsWith('https://')
      ) {
        try {
          const urlObj = new URL(fileUrlOrKey);
          let pathname = urlObj.pathname;
          if (pathname.startsWith(`/${this.bucketName}/`)) {
            pathname = pathname.replace(`/${this.bucketName}/`, '');
          } else if (pathname.startsWith('/')) {
            pathname = pathname.slice(1);
          }
          key = pathname;
        } catch {
          const parts = fileUrlOrKey.split('/');
          key = parts.slice(-3).join('/');
        }
      }
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );
        return true;
      } catch (err: any) {
        this.logger.warn(`S3 Delete error: ${err.message}`);
      }
    }

    // Local file cleanup
    try {
      if (fileUrlOrKey.includes('/uploads/')) {
        const relative = fileUrlOrKey.split('/uploads/')[1];
        const localPath = path.join(this.uploadDir, relative);
        if (fs.existsSync(localPath)) {
          await fs.promises.unlink(localPath);
          return true;
        }
      }
      return true;
    } catch (err: any) {
      return false;
    }
  }
}
