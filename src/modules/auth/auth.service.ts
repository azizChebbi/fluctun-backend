import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { jwtConstants } from './constants';
import { AddInstituteDto } from './dto/addInstitute.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAdmindto } from './dto/registerAdmin.dto';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';
import { Payload } from './jwt.strategy';
import * as bcrypt from 'bcrypt';
import base64url from 'base64url';
import * as generator from 'generate-password';
import { SendEmailDto } from './dto/sendEmail.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    let user;
    // check if user is a student
    user = await this.prisma.student.findUnique({
      where: {
        email,
      },
    });
    let isPasswordMatching = await this.comparePassword(pass, user.password);
    if (user && isPasswordMatching) {
      const { password, ...result } = user;
      return { ...result, role: 'student', instituteId: user.instituteId };
    }

    // check if user is teacher => teacher
    user = await this.prisma.teacher.findUnique({
      where: {
        email,
      },
    });
    isPasswordMatching = await this.comparePassword(pass, user.password);
    if (user && isPasswordMatching) {
      const { password, ...result } = user;
      return { ...result, role: 'teacher', instituteId: user.instituteId };
    }

    return null;
  }

  async login(dto: LoginDto, response: Response) {
    const user: any = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    const payload: Payload = {
      id: user.id,
      role: user.role,
      instituteId: user.instituteId,
    };
    const rt = this.getRefrechToken(payload);
    response.cookie('refresh_token', rt, {
      httpOnly: true,
    });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginAdmin(dto: LoginDto, response: Response) {
    const user: Admin = await this.prisma.admin.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('user not found');
    }
    const isPasswordMatching = await bcrypt.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('password is wrong');
    }
    const payload: Payload = {
      id: user.id,
      role: 'super-admin',
      instituteId: user.instituteId,
    };
    const rt = this.getRefrechToken(payload);
    response.cookie('refresh_token', rt, {
      httpOnly: true,
    });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async addInstitute(addInstituteDto: AddInstituteDto) {
    return await this.prisma.institute.create({
      data: addInstituteDto,
    });
  }

  async registerAdmin(registerAdminDto: RegisterAdmindto) {
    let user;
    user = await this.prisma.admin.findUnique({
      where: {
        email: registerAdminDto.email,
      },
    });
    if (user) {
      throw new HttpException(
        'an admin already exist with this email: ' + registerAdminDto.email,
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.prisma.student.findUnique({
      where: {
        email: registerAdminDto.email,
      },
    });
    if (user) {
      throw new HttpException(
        'a student already exist with this email: ' + registerAdminDto.email,
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.prisma.teacher.findUnique({
      where: { email: registerAdminDto.email },
    });
    if (user) {
      throw new HttpException(
        'a teacher already exist with this email: ' + registerAdminDto.email,
        HttpStatus.BAD_REQUEST,
      );
    }

    const password = generator.generate({
      length: 10,
      numbers: true,
    });
    console.log(password);
    const hashedPassword = await this.hashPassword('password');

    return await this.prisma.admin.create({
      data: {
        ...registerAdminDto,
        password: hashedPassword,
      },
    });
  }

  async registerStudents(registerStudentsDto: RegisterStudentDto[]) {
    if (registerStudentsDto == undefined || registerStudentsDto.length == 0) {
      throw new HttpException(
        'array should not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    // get the emails
    const emails = registerStudentsDto.map((student) => student.email);

    // get all the instituteIDs and check if all are ones
    const instituteIds = registerStudentsDto.map(
      (student) => student.instituteId,
    );
    // if the students array is empty or the students belongs to more than institute than its invalid request
    // or if there is duplicated emails(because emails are unique)

    if (new Set(emails).size < registerStudentsDto.length) {
      throw new HttpException(
        'some emails are duplicated',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Set(instituteIds).size > 1) {
      throw new HttpException(
        'institute id should be the same for all the students',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if the institute already exist(security check)
    const institute = await this.prisma.institute.findUnique({
      where: {
        id: instituteIds[0],
      },
    });
    if (!institute) {
      throw new HttpException(
        'Institute does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(emails);
    const teachers = await this.prisma.teacher.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    let deprecatedEmails = teachers.map((t) => t.email);
    if (teachers.length > 0) {
      throw new HttpException(
        `teachers already exist with some of these emails: ${deprecatedEmails.join(
          ', ',
        )}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const students = await this.prisma.student.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    deprecatedEmails = students.map((s) => s.email);
    if (students.length > 0) {
      throw new HttpException(
        `students already exist with  some of these emails: ${deprecatedEmails.join(
          ', ',
        )}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const admins = await this.prisma.admin.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    deprecatedEmails = admins.map((a) => a.email);
    if (admins.length > 0) {
      throw new HttpException(
        `admins already exist with these emails: ${emails.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const studentsArray = await Promise.all(
      registerStudentsDto.map(async (s) => {
        const password = generator.generate({
          length: 10,
          numbers: true,
        });
        const hashedPassword = await bcrypt.hash(password, 10);
        return {
          ...s,
          password: hashedPassword,
        };
      }),
    );

    return this.prisma.student.createMany({
      data: studentsArray,
    });
  }

  async registerTeachers(registerTeachersDto: RegisterTeacherDto[]) {
    if (registerTeachersDto == undefined || registerTeachersDto.length == 0) {
      throw new HttpException(
        'array should not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emails = registerTeachersDto.map((teacher) => teacher.email);
    const cins = registerTeachersDto.map((teacher) => teacher.cin);

    // get all the instituteIDs and check if all are ones
    const instituteIds = registerTeachersDto.map(
      (teacher) => teacher.instituteId,
    );
    // if the students array is empty or the students belongs to more than institute than its invalid request
    // or if there is duplicated emails(because emails are unique)
    if (registerTeachersDto.length == 0) {
      throw new HttpException(
        'array should not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Set(emails).size < registerTeachersDto.length) {
      throw new HttpException(
        'some emails are duplicated',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Set(cins).size < registerTeachersDto.length) {
      throw new HttpException(
        'some cins are duplicated',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Set(instituteIds).size > 1) {
      throw new HttpException(
        'institute id should be the same for all the teachers',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if the institute already exist(security check)
    const institute = await this.prisma.institute.findUnique({
      where: {
        id: instituteIds[0],
      },
    });
    if (!institute) {
      throw new HttpException(
        'Institute does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const teachers = await this.prisma.teacher.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    const deprecatedEmails = teachers.map((t) => t.email);
    if (teachers.length > 0) {
      throw new HttpException(
        `teachers already exist with some emails: ${deprecatedEmails.join(
          ', ',
        )}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const students = await this.prisma.student.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    if (students.length > 0) {
      throw new HttpException(
        `students already exist with these emails: ${emails.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const admins = await this.prisma.admin.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    if (admins.length > 0) {
      throw new HttpException(
        `admins already exist with these emails: ${emails.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const teachersArray = await Promise.all(
      registerTeachersDto.map(async (t) => {
        const password = generator.generate({
          length: 10,
          numbers: true,
        });
        console.log(password);
        const hashedPassword = await bcrypt.hash(password, 10);
        return {
          ...t,
          password: hashedPassword,
        };
      }),
    );
    return this.prisma.teacher.createMany({
      data: teachersArray,
    });
  }

  getRefrechToken(payload: { id: string; role: string }) {
    const rt = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION_DATE'),
    });
    return rt;
  }

  async refresh(rt: string) {
    try {
      const validated = this.jwtService.verify(rt, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
      });
      let user;
      // check if user is a valid admin
      if (validated.role == 'super-admin') {
        user = await this.prisma.admin.findUnique({
          where: {
            id: validated.id,
          },
        });
        if (!user) {
          throw new UnauthorizedException();
        }
      }

      // check if user is a valid teacher
      if (validated.role == 'teacher') {
        user = await this.prisma.teacher.findUnique({
          where: {
            id: validated.id,
          },
        });

        if (!user) {
          throw new UnauthorizedException();
        }
      }

      // check if user is a valid student
      if (validated.role == 'student') {
        user = await this.prisma.student.findUnique({
          where: {
            id: validated.id,
          },
        });

        if (!user) {
          throw new UnauthorizedException();
        }
      }
      const at = this.jwtService.sign(
        {
          userId: validated.id,
          role: validated.role,
          instituteId: validated.instituteId,
        },
        { secret: jwtConstants.secret, expiresIn: '600' },
      );
      return {
        access_token: at,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async sendEmail(dto: SendEmailDto) {
    const { email } = dto;

    let user;
    // check if email belongs to student
    user = await this.prisma.student.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (user) {
      const secret = jwtConstants.reset_secret_key + user.password;
      const payload = {
        email,
        id: user.id,
      };
      const token = this.jwtService.sign(payload, {
        secret,
        expiresIn: 400,
      });
      const encodedUrl = base64url(JSON.stringify(token));
      const link = `http://localhost:3000/reset-password/${user.id}/${encodedUrl}`;
      console.log(link);
      return link;
    }
    //else
    user = await this.prisma.teacher.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    if (user) {
      // work to be done

      return user;
    }

    throw new UnauthorizedException('Email not found');
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }
  }

  async hashPassword(passwordInPlaintext: string) {
    return await bcrypt.hash(passwordInPlaintext, 10);
  }

  async comparePassword(passwordInPlainText: string, hashedPassword: string) {
    return await bcrypt.compare(passwordInPlainText, hashedPassword);
  }
}
