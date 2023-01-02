import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterAdmindto } from './dto/registerAdmin.dto';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { RoleGuard } from './role.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register-admin')
  async registerAdmin(
    @Body(new ValidationPipe()) registerAdminDto: RegisterAdmindto,
  ) {
    return this.authService.registerAdmin(registerAdminDto);
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
