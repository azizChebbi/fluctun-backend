import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddAnswerDto } from './dto/addAnswer.dto';
import { AddQuestionDto } from './dto/addQuestion.dto';
import { Express } from 'express';
import { AwsService } from 'src/modules/aws/aws.service';
import { QuestionQueryParams } from './types';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AwsService) private awsService: AwsService,
  ) {}

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

  async getQuestions(query: QuestionQueryParams) {
    return await this.prisma.question.findMany({
      where: {
        ...(query.type === 'answered' && {
          answers: {
            some: {
              id: {
                not: undefined,
              },
            },
          },
        }),
        ...(query.type === 'unanswered' && {
          answers: {
            every: {
              id: undefined,
            },
          },
        }),
        ...(query.subjects && {
          subject: {
            in: query.subjects,
          },
        }),
        ...(query.startDate && {
          createdAt: {
            gte: new Date(query.startDate),
          },
        }),
        ...(query.endDate && {
          createdAt: {
            lte: new Date(query.endDate),
          },
        }),
      },
      orderBy: {
        createdAt: query.dateOrder || 'desc',
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.awsService.upload(file);
  }
}
