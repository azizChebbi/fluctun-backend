import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AwsModule } from 'src/modules/aws/aws.module';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports: [PrismaModule, AwsModule],
})
export class ProfileModule {}
