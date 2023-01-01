import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports: [PrismaService],
})
export class ProfileModule {}
