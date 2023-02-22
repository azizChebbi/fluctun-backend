import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  async sendEmail(email: string, text: string) {
    try {
      const d = await this.mailService.sendMail({
        to: 'azizchebbi106@gmail.com',
        from: 'fluctun@gmail.com',
        subject: 'Reset password link',
        text,
      });
      console.log(d);
      return `email is sent to ${email} successfully`;
    } catch (error) {
      return 'Email error: ' + error;
    }
  }
}