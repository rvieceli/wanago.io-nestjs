import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(private configService: ConfigurationService) {
    this.transporter = createTransport({
      service: this.configService.get('EMAIL_SERVICE'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendMail(options: Mail.Options) {
    return this.transporter.sendMail(options);
  }
}
