import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async editStudentProfile() {
    return null;
  }

  async editTeacherProfile() {
    return null;
  }
}
