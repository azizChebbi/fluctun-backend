import { HttpException, Inject, Injectable } from '@nestjs/common';
import { AwsService } from 'src/modules/aws/aws.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AddDocumentDto } from './dto/addDocument.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AwsService) private aws: AwsService,
  ) {}

  async getSubjects(instituteId) {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        instituteId,
      },
      select: {
        subject: true,
      },
    });
    const subjects = teachers.map((teacher) => teacher.subject);
    return [...new Set(subjects)];
  }

  async getLevels(instituteId) {
    const students = await this.prisma.student.findMany({
      where: {
        instituteId,
      },
      select: {
        level: true,
      },
    });
    const levels = students.map((student) => student.level);
    return [...new Set(levels)];
  }

  async addDocument(dto: AddDocumentDto, file: Express.Multer.File) {
    try {
      const uploadedFile = await this.aws.upload(file);
      const document = await this.prisma.document.create({
        data: {
          ...dto,
          levels: dto.levels.split(','),
          url: uploadedFile.Location,
          size: parseInt(dto.size, 10),
        },
      });
      return document;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }
  }
}
