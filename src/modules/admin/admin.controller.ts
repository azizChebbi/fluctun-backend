import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { AdminService } from './admin.service';
import { UpdateStudentDto } from './dto/updateStudent.dto';
import { UpdateTeacherDto } from './dto/updateTeacher.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, new RoleGuard('super-admin'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('teachers')
  async getTeachers() {
    return this.adminService.getTeachers();
  }

  @Delete('teachers')
  async deleteTeachers() {
    return this.adminService.deleteTeachers();
  }

  @Get('students')
  async getStudents() {
    return this.adminService.getStudents();
  }

  @Delete('students')
  async deleteStudents() {
    return this.adminService.deleteStudents();
  }

  @Delete('teacher')
  async deleteTeacher(@Query('id') id: string) {
    return this.adminService.deleteTeacher(id);
  }

  @Put('teacher')
  async updateTeacher(@Body(new ValidationPipe()) dto: UpdateTeacherDto) {
    return this.adminService.updateTeacher(dto);
  }

  @Delete('student')
  async deleteStudent(@Query('id') id: string) {
    return this.adminService.deleteStudent(id);
  }

  @Put('student')
  async updateStudent(@Body(new ValidationPipe()) dto: UpdateStudentDto) {
    return this.adminService.updateStudent(dto);
  }
}
