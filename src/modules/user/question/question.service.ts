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
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

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
        // i want to get the answers answered by an array of teachers name, each name consist of first name and last name
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
    });

    let questionsNewShape = questions.map((question) => {
      const q = {
        ...question,
        title: question.question,
        answered: question.answers.length > 0,
      };
      delete q.question;
      return q;
    });

    if (query.type) {
      questionsNewShape = questionsNewShape.filter(
        (question) => question.answered === (query.type === 'answered'),
      );
    }

    return {
      questions: questionsNewShape,
      count: questionsNewShape.length,
    };
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
  // function that returns the number of questions per day, per week and per month
  async getQuestionsPerPeriod(req) {
    const { instituteId } = req.user;
    // i don't want to return the questions but the number of questions per period
    // so i will use the count function

    const questionsPerDay = await this.prisma.question.count({
      where: {
        student: {
          instituteId,
        },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
    });

    const questionsPerWeek = await this.prisma.question.count({
      where: {
        student: {
          instituteId,
        },
        createdAt: {
          gte: new Date(
            new Date().setDate(
              new Date().getDate() - this.getCountOfTodayFromDaysOfTheWeek(),
            ),
          ),
        },
      },
    });

    // in your case you are getting the number of questions starting from 30 days ago, but today is 18 march so i want you to get the number of questions from 1 march, here we took march as an example
    // so i will get the number of questions from 1st day in the current month to the last day in the current month
    const questionsPerMonth = await this.prisma.question.count({
      where: {
        student: {
          instituteId,
        },
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return {
      day: questionsPerDay,
      week: questionsPerWeek,
      month: questionsPerMonth,
    };
  }

  async getAnswersPerPeriod(req) {
    const { instituteId } = req.user;
    // i don't want to return the questions but the number of questions per period
    // so i will use the count function

    const answersPerDay = await this.prisma.answer.count({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
    });

    const answersPerWeek = await this.prisma.answer.count({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(
            new Date().setDate(
              new Date().getDate() - this.getCountOfTodayFromDaysOfTheWeek(),
            ),
          ),
        },
      },
    });

    // in your case you are getting the number of questions starting from 30 days ago, but today is 18 march so i want you to get the number of questions from 1 march, here we took march as an example
    // so i will get the number of questions from 1st day in the current month to the last day in the current month
    const answersPerMonth = await this.prisma.answer.count({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return {
      day: answersPerDay,
      week: answersPerWeek,
      month: answersPerMonth,
    };
  }

  // get the count of today from days of the week starting from monday
  getCountOfTodayFromDaysOfTheWeek() {
    const daysOfTheWeek = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const today = new Date().getDay();
    return daysOfTheWeek.slice(0, today).length;
  }

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
    const questionsPerMonth = questions.reduce((acc, question) => {
      const month = question.createdAt.getMonth();
      if (month in acc) {
        acc[month]++;
      } else {
        acc[month] = 1;
      }
      return acc;
    }, {});

    const answers = await this.prisma.answer.findMany({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(year, 8, 1),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const answersPerMonth = answers.reduce((acc, answer) => {
      const month = answer.createdAt.getMonth();
      if (month in acc) {
        acc[month]++;
      } else {
        acc[month] = 1;
      }
      return acc;
    }, {});

    return {
      answers: answersPerMonth,
      questions: questionsPerMonth,
    };
  }

  async getQuestionsAndAnswersPerLevel(req) {
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
      select: {
        student: {
          select: {
            level: true,
          },
        },
      },
    });

    // get number of questions per level
    const questionsPerLevel = questions.reduce((acc, question) => {
      const level = question.student.level;
      if (level in acc) {
        acc[level]++;
      } else {
        acc[level] = 1;
      }
      return acc;
    }, {});

    const answers = await this.prisma.answer.findMany({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(year, 8, 1),
        },
      },
      select: {
        question: {
          select: {
            student: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });

    // get number of answers per level
    const answersPerLevel = answers.reduce((acc, answer) => {
      const level = answer.question.student.level;
      if (level in acc) {
        acc[level]++;
      } else {
        acc[level] = 1;
      }
      return acc;
    }, {});

    return {
      answers: answersPerLevel,
      questions: questionsPerLevel,
    };
  }

  async getQuestionsAndAnswersPerSubject(req) {
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
      select: {
        subject: true,
      },
    });

    // get number of questions per subject
    const questionsPerSubject = questions.reduce((acc, question) => {
      const subject = question.subject;
      if (subject in acc) {
        acc[subject]++;
      } else {
        acc[subject] = 1;
      }
      return acc;
    }, {});

    const answers = await this.prisma.answer.findMany({
      where: {
        question: {
          student: {
            instituteId,
          },
        },
        createdAt: {
          gte: new Date(year, 8, 1),
        },
      },
      select: {
        question: {
          select: {
            subject: true,
          },
        },
      },
    });

    // get number of answers per subject
    const answersPerSubject = answers.reduce((acc, answer) => {
      const subject = answer.question.subject;
      if (subject in acc) {
        acc[subject]++;
      } else {
        acc[subject] = 1;
      }
      return acc;
    }, {});

    return {
      answers: answersPerSubject,
      questions: questionsPerSubject,
    };
  }

  // get the top 5 students who asked the most questions
  async getTopStudents(req) {
    const { instituteId } = req.user;
    const questions = await this.prisma.question.findMany({
      where: {
        student: {
          instituteId,
        },
      },
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
            level: true,
          },
        },
      },
    });

    // get number of questions per student
    const questionsPerStudent: { [key: string]: number } = questions.reduce(
      (acc, question) => {
        const student = question.student;
        if (student.id in acc) {
          acc[student.id]++;
        } else {
          acc[student.id] = 1;
        }
        return acc;
      },
      {},
    );

    // sort students by number of questions in descending order and return the top 5 students in form of an array of objects containing id as a key and number of questions as a value
    const topStudents = Object.entries(questionsPerStudent).sort(
      (a, b) => b[1] - a[1],
    );
    return topStudents;
  }

  async getTopTeachers(req) {
    const { instituteId } = req.user;
    const answers = await this.prisma.answer.findMany({
      where: {
        teacher: {
          instituteId,
        },
      },
      select: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
      },
    });

    // get number of answers per teacher
    const answersPerTeacher: { [key: string]: number } = answers.reduce(
      (acc, answer) => {
        const teacher = answer.teacher;
        if (teacher.id in acc) {
          acc[teacher.id]++;
        } else {
          acc[teacher.id] = 1;
        }
        return acc;
      },
      {},
    );

    // sort teachers by number of answers in descending order and return the top 5 teachers in form of an array of objects containing id as a key and number of answers as a value
    const topTeachers = Object.entries(answersPerTeacher).sort(
      (a, b) => b[1] - a[1],
    );
    return topTeachers;
  }
}
