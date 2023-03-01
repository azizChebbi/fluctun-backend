import { Module } from '@nestjs/common';
import { AwsModule } from 'src/modules/aws/aws.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
