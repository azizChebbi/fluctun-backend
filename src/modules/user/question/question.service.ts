import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddAnswerDto } from './dto/addAnswer.dto';
import { AddQuestionDto } from './dto/addQuestion.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async addQuestion(addQuestionDto: AddQuestionDto, id: string): Promise<any> {
    return await this.prisma.question.create({
      data: {
        ...addQuestionDto,
        studentId: id,
      },
    });
  }

  async addAnswer(addAnswerDto: AddAnswerDto, teacherId: string) {
    return await this.prisma.answer.create({
      data: {
        ...addAnswerDto,
        teacherId,
      },
    });
  }

  async getQuestion(questionId: string) {
    return await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        answers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
            comments: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                  },
                },
              },
            },
          },
        },
        comments: true,
      },
    });
  }

  async getQuestions() {
    return await this.prisma.question.findMany();
  }

  async uploadImage() {
    return null;
  }
}
