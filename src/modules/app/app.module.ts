import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionModule } from '../user/question/question.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from '../email/email.module';
import { ProfileModule } from '../user/profile/profile.module';
import { AwsService } from '../aws/aws.service';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    QuestionModule,
    AuthModule,
    AdminModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        auth: {
          user: 'apikey',
          pass: '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',
        },
      },
    }),
    EmailModule,
    ProfileModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

//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
