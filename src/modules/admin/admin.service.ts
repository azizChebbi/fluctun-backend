import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/updateStudent.dto';
import { UpdateTeacherDto } from './dto/updateTeacher.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      // include question ids from answers
      include: {
        answers: {
          select: {
            question: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    return teachers.map((teacher) => {
      delete teacher.password;
      return teacher;
    });
  }

  async deleteTeachers() {
    return await this.prisma.teacher.deleteMany({});
  }

  async getStudents() {
    const students = await this.prisma.student.findMany({
      include: {
        questions: {
          select: {
            id: true,
          },
        },
      },
    });
    return students.map((student) => {
      delete student.password;
      return student;
    });
  }
  async deleteStudents() {
    return await this.prisma.student.deleteMany({});
  }

  async deleteTeacher(id: string) {
    return await this.prisma.teacher.delete({
      where: {
        id,
      },
    });
  }

  async updateTeacher(dto: UpdateTeacherDto) {
    const { id, ...data } = dto;
    return await this.prisma.teacher.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteStudent(id: string) {
    return await this.prisma.student.delete({
      where: {
        id,
      },
    });
  }

  async updateStudent(dto: UpdateStudentDto) {
    const { id, ...data } = dto;
    return await this.prisma.student.update({
      where: {
        id,
      },
      data,
    });
  }

  // get the number of questions per month startin from september to july
  async getQuestionsAndAnswersPerMonth(req) {
    const { instituteId } = req.user;
    const date = new Date();
    const month = date.getMonth();
    let year = date.getFullYear();
    if (month < 6) year--;
    const questions = await this.prisma.question.findMany({
      where: {
        student: {
          instituteId,
        },
        createdAt: {
          gte: new Date(year, 8, 1),
        },
      },
    });

    // const answers = await this.prisma.question.findMany({
    //   where: {
    //     student: {
    //       instituteId,
    //     },
    //   },
    // });

    // get the same thing as questions and add group by month
    // const questionsPerMonth = await this.prisma.question.findMany({
    //   where: {
    //     student: {
    //       instituteId,
    //     },
    //     createdAt: {
    //       gte: new Date(year, 8, 1),
    //     },
    //   },
    //   groupBy: {
    //     createdAt: {
    //       by: 'month',
    //     },
    //   },
    // });
    const answers = await this.prisma.answer.groupBy({
      by: ['createdAt'],
      where: {
        teacher: {
          instituteId,
        },
      },
    });

    return answers;
  }
}
