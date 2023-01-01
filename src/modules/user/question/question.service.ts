import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { stringify } from 'querystring';
import { PrismaService } from '../../prisma/prisma.service';
import { AddAnswerDto } from './dto/addAnswer.dto';
import { AddQuestionDto } from './dto/addQuestion.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async addQuestion(addQuestionDto: AddQuestionDto, id: string): Promise<any> {
    const ID: string = new ObjectId().toString();
    return await this.prisma.question.create({
      data: {
        ...addQuestionDto,
        studentId: ID,
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
}
