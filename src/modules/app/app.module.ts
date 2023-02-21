import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionModule } from '../user/question/question.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    QuestionModule,
    AuthModule,
    AdminModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
