import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EditStudentProfileDto } from './dto/editStudentProfile.dto';
import { EditTeacherProfileDto } from './dto/editTeacherProfile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileData(req) {
    const { id, role } = req.user;
    if (role == 'student') {
      return await this.prisma.student.findUnique({
        where: { id },
      });
    }
    if (role == 'teacher') {
      return await this.prisma.teacher.findUnique({
        where: { id },
      });
    }
    return null;
  }

  async editStudentProfile(
    edtitStudentProfileDto: EditStudentProfileDto,
    studentId: string,
  ) {
    return await this.prisma.student.update({
      data: edtitStudentProfileDto,
      where: {
        id: studentId,
      },
    });
  }

  async editTeacherProfile(
    editTeacherProfileDto: EditTeacherProfileDto,
    teacherId: string,
  ) {
    return await this.prisma.teacher.update({
      data: editTeacherProfileDto,
      where: {
        id: teacherId,
      },
    });
  }
}
