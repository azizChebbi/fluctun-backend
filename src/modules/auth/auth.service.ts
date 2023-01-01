import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PrismaService) private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // here we do the logic to retireve user from database
    const user = {
      id: new ObjectId(),
      email: 'jhon',
      role: 'student',
      password: 'changeme',
    };
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerStudents(registerStudentsDto: RegisterStudentDto[]) {
    return this.prisma.student.createMany({
      data: registerStudentsDto,
    });
  }

  async registerTeachers(registerTeachersDto: RegisterTeacherDto[]) {
    return this.prisma.teacher.createMany({
      data: registerTeachersDto,
    });
  }
}
