import {
  Body,
  Controller,
  ParseArrayPipe,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { AddInstituteDto } from './dto/addInstitute.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAdmindto } from './dto/registerAdmin.dto';
import { RegisterStudentDto } from './dto/registerStudent.dto';
import { RegisterTeacherDto } from './dto/registerTeacher.dto';
import { SendEmailDto } from './dto/sendEmail.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RoleGuard } from './role.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body(new ValidationPipe()) dto: LoginDto,
  ) {
    return this.authService.login(dto, response);
  }

  @Post('loginAdmin')
  async loginAdmin(
    @Res({ passthrough: true }) response: Response,
    @Body(new ValidationPipe()) dto: LoginDto,
  ) {
    return this.authService.loginAdmin(dto, response);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // response.cookie('refresh_token', null, { httpOnly: true });
    response.clearCookie('refresh_token');
    return null;
  }

  @Post('refresh')
  async refresh(@Req() req: ExpressRequest) {
    const rt = req.cookies['refresh_token'];
    console.log('cookies: ', req.cookies);
    if (!rt) throw new UnauthorizedException();
    return this.authService.refresh(rt);
  }

  @Post('institute')
  async addInstitute(
    @Body(new ValidationPipe()) addInstituteDto: AddInstituteDto,
  ) {
    return this.authService.addInstitute(addInstituteDto);
  }

  @Post('register-admin')
  async registerAdmin(
    @Body(new ValidationPipe()) registerAdminDto: RegisterAdmindto,
  ) {
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Post('send-email')
  async sendEmail(@Body(new ValidationPipe()) dto: SendEmailDto) {
    return this.authService.sendEmail(dto);
  }

  @UseGuards(JwtAuthGuard, new RoleGuard('super-admin'))
  @Post('register-students')
  async registerStudents(
    @Body(new ParseArrayPipe({ items: RegisterStudentDto, whitelist: true }))
    registerStudentsDto: RegisterStudentDto[],
    @Req() req: ExpressRequest,
  ) {
    return this.authService.registerStudents(registerStudentsDto);
  }

  @UseGuards(JwtAuthGuard, new RoleGuard('super-admin'))
  @Post('register-teachers')
  async registerTeachers(
    @Body(new ParseArrayPipe({ items: RegisterTeacherDto, whitelist: true }))
    registerTeachersDto: RegisterTeacherDto[],
  ) {
    return this.authService.registerTeachers(registerTeachersDto);
  }
}
