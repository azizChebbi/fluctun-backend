import { Inject, Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { AwsService } from 'src/modules/aws/aws.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EditStudentProfileDto } from './dto/editStudentProfile.dto';
import { EditTeacherProfileDto } from './dto/editTeacherProfile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AwsService) private awsService: AwsService,
  ) {}

  async getProfileData(req) {
    const { id, role } = req.user;
    if (role == 'student') {
      const student = await this.prisma.student.findUnique({
        where: { id },
      });
      delete student.password;
      return student;
    }
    if (role == 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id },
      });
      delete teacher.password;
      return teacher;
    }
    throw new UnauthorizedException();
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

  async getQuestions(req) {
    console.log('getQuestions');
    const { id, role } = req.user;

    if (role == 'student') {
      const questions = await this.prisma.question.findMany({
        where: {
          studentId: id,
        },
      });
      return questions;
    }

    if (role == 'teacher') {
      const questions = await this.prisma.question.findMany({
        where: {
          answers: {
            some: {
              teacherId: id,
            },
          },
        },
        select: {
          id: true,
          question: true,
          createdAt: true,
        },
      });
      return questions;
    }
    throw new UnauthorizedException('this is fucking unauthauried');
  }

  async updateImage(req: any, file: Express.Multer.File) {
    const { id, role } = req.user;
    const res = await this.awsService.upload(file);
    if (role == 'teacher')
      await this.prisma.teacher.update({
        where: {
          id,
        },
        data: {
          photo: res.Location,
        },
      });
    else if (role == 'student') {
      await this.prisma.student.update({
        where: {
          id,
        },
        data: {
          photo: res.Location,
        },
      });
    }
    return res;
  }

  async deleteImage(req: any) {
    const { id, role } = req.user;
    if (role == 'teacher')
      await this.prisma.teacher.update({
        where: {
          id,
        },
        data: {
          photo: null,
        },
      });
    else if (role == 'student') {
      await this.prisma.student.update({
        where: {
          id,
        },
        data: {
          photo: null,
        },
      });
    }
  }
}
