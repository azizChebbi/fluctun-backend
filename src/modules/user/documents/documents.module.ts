import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AwsModule } from 'src/modules/aws/aws.module';

@Module({
  providers: [DocumentsService],
  controllers: [DocumentsController],
  imports: [PrismaModule, AwsModule],
})
export class DocumentsModule {}
