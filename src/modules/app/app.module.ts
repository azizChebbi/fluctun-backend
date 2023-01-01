import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionModule } from '../user/question/question.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [QuestionModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
