import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

export interface SendFacultyCredentialsDto {
   to: string;
   name: string;
   loginId?: string;
   password: string;
   designation?: string;
   role?: string;
   schoolName?: string;
   loginUrl?: string;
   subject?: string;
   isPasswordReset?: boolean;
}

@Injectable()
export class MailService {
   private readonly logger = new Logger(MailService.name);

   constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService,
   ) { }

   /**
    * Dispatch faculty welcome credentials or password reset email using MailerService and Handlebars templates
    */
   async sendFacultyCredentials(data: SendFacultyCredentialsDto): Promise<boolean> {
      const schoolName = data.schoolName || 'School Management Portal';
      const loginUrl =
         data.loginUrl ||
         this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000/login');

      const subject =
         data.subject ||
         (data.isPasswordReset
            ? `${schoolName} - Your Portal Password Has Been Reset`
            : `Welcome to ${schoolName} - Your Portal Login Credentials`);

      try {
         await this.mailerService.sendMail({
            to: data.to,
            subject,
            template: './faculty-credentials',
            context: {
               to: data.to,
               name: data.name,
               loginId: data.loginId,
               password: data.password,
               role: data.role,
               designation: data.designation,
               schoolName,
               loginUrl,
               isPasswordReset: Boolean(data.isPasswordReset),
               year: new Date().getFullYear(),
            },
         });

         this.logger.log(`✅ Faculty credentials email dispatched to: ${data.to}`);
         return true;
      } catch (err) {
         this.logger.error(`❌ Failed to send credentials email to ${data.to}:`, err);
         return false;
      }
   }
}
