import {
  Body,
  Controller,
  Put,
  UseGuards,
  Request,
  Get,
  Req,
  Param,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Post,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RoleGuard } from 'src/modules/auth/role.guard';
import { EditStudentProfileDto } from './dto/editStudentProfile.dto';
import { EditTeacherProfileDto } from './dto/editTeacherProfile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Get('questions')
  async getQuestions(@Req() req) {
    return this.profileService.getQuestions(req);
  }

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Get(':id')
  async getUserProfile(@Param('id') id, @Req() req) {
    if (req.user.id !== id) throw new UnauthorizedException();
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

  @Post('update-image')
  @UseGuards(new RoleGuard(['student', 'teacher']))
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return this.profileService.updateImage(req, file);
  }

  @Delete('delete-image')
  async deleteImage(@Req() req) {
    return this.profileService.deleteImage(req);
  }
}
