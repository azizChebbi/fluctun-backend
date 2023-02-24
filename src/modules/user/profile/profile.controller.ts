import {
  Body,
  Controller,
  Put,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RoleGuard } from 'src/modules/auth/role.guard';
import { EditStudentProfileDto } from './dto/editStudentProfile.dto';
import { EditTeacherProfileDto } from './dto/editTeacherProfile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Get('')
  async getUserProfile(@Req() req) {
    return this.profileService.getProfileData(req);
  }

  @UseGuards(new RoleGuard('student'))
  @Put('student')
  async editStudentProfile(
    @Body() editStudentProfileDto: EditStudentProfileDto,
    @Request() req,
  ) {
    return this.profileService.editStudentProfile(
      editStudentProfileDto,
      req.user.id,
    );
  }

  @UseGuards(new RoleGuard('teacher'))
  @Put('teacher')
  async editTeacherProfile(
    editTeacherProfileDto: EditTeacherProfileDto,
    @Request() req,
  ) {
    return this.profileService.editTeacherProfile(
      editTeacherProfileDto,
      req.user.id,
    );
  }
}
