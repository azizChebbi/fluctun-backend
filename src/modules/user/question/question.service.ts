import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddAnswerDto } from './dto/addAnswer.dto';
import { AddQuestionDto } from './dto/addQuestion.dto';
import { AwsService } from 'src/modules/aws/aws.service';
import { QuestionQueryParams } from './types';
import { ObjectId } from 'mongodb';
import { AddCommentDto } from './dto/addComment.dto';
import { Types } from 'mongoose';
import { Payload } from 'src/modules/auth/jwt.strategy';
import { EditQuestionDto } from './dto/editQuestion.dto';
import { EditAnswerDto } from './dto/editAnswer.dto';

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

  async getAnswer(answerId: string) {
    return await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    });
  }

  async getQuestion(questionId: string) {
    try {
      const question = await this.prisma.question.findUnique({
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
                  student: {
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
              student: {
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
      });
      if (!question) {
        throw new HttpException('Question not found', 404);
      }
      return question;
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async editQuestion(dto: EditQuestionDto, id: string) {
    return await this.prisma.question.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteQuestion(id: string) {
    return await this.prisma.question.delete({
      where: {
        id,
      },
    });
  }

  async deleteAnswer(id: string) {
    return await this.prisma.answer.delete({
      where: {
        id,
      },
    });
  }

  async editAnswer(dto: EditAnswerDto, id: string) {
    return await this.prisma.answer.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async getQuestions(query: QuestionQueryParams, user: Payload) {
    const { id: userId, instituteId } = user;
    const student = await this.prisma.student.findUnique({
      where: {
        id: userId,
      },
    });
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: userId,
      },
    });

    console.log(student, teacher);
    const questions = await this.prisma.question.findMany({
      where: {
        student: {
          instituteId,
          ...(query.levels
            ? {
                level: {
                  in: query.levels,
                },
              }
            : student && {
                level: student.level,
              }),
        },
        ...(query.subjects
          ? {
              subject: {
                in: query.subjects,
              },
            }
          : teacher && {
              subject: teacher.subject,
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
      select: {
        id: true,
        question: true,
        description: true,
        subject: true,
        createdAt: true,
        lastUpdatedAt: true,
        answers: {
          select: {
            id: true,
          },
        },
      },
    });

    const questionsWithAnswered = questions.map((question) => {
      const q = {
        ...question,
        title: question.question,
        answered: question.answers.length > 0,
      };
      delete q.answers;
      delete q.question;
      return q;
    });

    if (query.type) {
      return questionsWithAnswered.filter(
        (question) => question.answered === (query.type === 'answered'),
      );
    }

    return questionsWithAnswered;
  }

  async addComment(dto: AddCommentDto) {
    const { answerId, questionId } = dto;
    const isQuestionOrAnswerIDAreValid = Types.ObjectId.isValid(
      answerId || questionId,
    );
    if (!isQuestionOrAnswerIDAreValid) {
      throw new HttpException('Invalid question or answer id', 400);
    }

    const isStudentOrTeacherIdAreValid = Types.ObjectId.isValid(
      dto.studentId || dto.teacherId,
    );
    if (!isStudentOrTeacherIdAreValid) {
      throw new HttpException('Invalid student or teacher id', 400);
    }

    return await this.prisma.comment.create({
      data: dto,
    });
  }

  async deleteComment(id: string) {
    return await this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.awsService.upload(file);
  }
}
