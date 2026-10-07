import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        const port = Number(config.get<number>('SMTP_PORT')) || 587;
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');
        const rawSecure = config.get('SMTP_SECURE');
        const secure =
          typeof rawSecure === 'boolean'
            ? rawSecure
            : String(rawSecure).toLowerCase() === 'true';

        const defaultFrom =
          config.get<string>('SMTP_FROM') ||
          `"School Management Portal" <${user || 'no-reply@school.com'}>`;

        // Configure transport: standard SMTP if config is present, or stream transport for development simulation
        const transport =
          host && user && pass
            ? {
                host,
                port,
                secure,
                auth: { user, pass },
              }
            : {
                streamTransport: true,
                newline: 'unix',
                buffer: true,
              };

        return {
          transport,
          defaults: {
            from: defaultFrom,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
