import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { emit } from 'process';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAdmindto } from './dto/registerAdmin.dto';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';
import { Role } from './role.guard';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PrismaService) private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    let user;
    // check if user is a student
    user = await this.prisma.student.findUnique({
      where: {
        email,
      },
    });
    if (user && user.password == pass) {
      const { password, ...result } = user;
      return { ...result, role: 'student' };
    }

    // check if user is teacher => teacher | admin
    user = await this.prisma.teacher.findUnique({
      where: {
        email,
      },
    });
    if (user && user.password == pass) {
      const { password, ...result } = user;
      return { ...result, role: user.isAdmin ? 'admin' : 'teacher' };
    }

    // check if user is super admin => teacher | admin
    user = await this.prisma.admin.findUnique({
      where: {
        email,
      },
    });
    if (user && user.password == pass) {
      const { password, ...result } = user;
      return { ...result, role: 'super-admin' };
    }
    // here we do the logic to retireve user from database
    // const user = {
    //   id: new ObjectId(),
    //   email: 'jhon',
    //   role: 'student',
    //   password: 'changeme',
    // };
    // if (user && user.password === pass) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
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
        'an student already exist with this email: ' + registerAdminDto.email,
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.prisma.teacher.findUnique({
      where: { email: registerAdminDto.email },
    });
    if (user) {
      throw new HttpException(
        'an teacher already exist with this email: ' + registerAdminDto.email,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.prisma.admin.create({
      data: registerAdminDto,
    });
  }

  async registerStudents(registerStudentsDto: RegisterStudentDto[]) {
    const emails = registerStudentsDto.map((student) => student.email);

    const teachers = await this.prisma.teacher.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    if (teachers) {
      throw new HttpException(
        `teachers already exist with these emails: ${emails.join(', ')}`,
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
    if (students) {
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
    if (admins) {
      throw new HttpException(
        `admins already exist with these emails: ${emails.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.student.createMany({
      data: registerStudentsDto,
    });
  }

  async registerTeachers(registerTeachersDto: RegisterTeacherDto[]) {
    const emails = registerTeachersDto.map((teacher) => teacher.email);

    const teachers = await this.prisma.teacher.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
    if (teachers) {
      throw new HttpException(
        `teachers already exist with these emails: ${emails.join(', ')}`,
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
    if (students) {
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
    if (admins) {
      throw new HttpException(
        `admins already exist with these emails: ${emails.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.teacher.createMany({
      data: registerTeachersDto,
    });
  }
}
