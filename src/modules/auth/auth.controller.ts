import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';
import { RoleGuard } from './role.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(new RoleGuard('admin'))
  @Post('register-students')
  async registerStudents(@Body() registerStudentsDto: RegisterStudentDto[]) {
    return this.authService.registerStudents(registerStudentsDto);
  }

  @UseGuards(new RoleGuard('admin'))
  @Post('register-teachers')
  async registerTeachers(registerTeachersDto: RegisterTeacherDto[]) {
    return this.authService.registerTeachers(registerTeachersDto);
  }
}
