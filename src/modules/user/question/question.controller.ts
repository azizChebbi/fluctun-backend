import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/modules/auth/role.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AddAnswerDto } from './dto/addAnswer.dto';
import { AddQuestionDto } from './dto/addQuestion.dto';
import { QuestionService } from './question.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionQueryParams } from './types';
import { AddCommentDto } from './dto/addComment.dto';
import { EditAnswerDto } from './dto/editAnswer.dto';

@UseGuards(JwtAuthGuard)
@Controller('questions')
@ApiTags('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(new RoleGuard('super-admin'))
  @Get('top-students')
  async getTopStudents(@Req() req) {
    return this.questionService.getTopStudents(req);
  }

  // get top teachers
  @UseGuards(new RoleGuard('super-admin'))
  @Get('top-teachers')
  async getTopTeachers(@Req() req) {
    return this.questionService.getTopTeachers(req);
  }

  @UseGuards(new RoleGuard('super-admin'))
  @Get('questionsAndAnswersPerMonth')
  async getQuestionsAndAnswersPerMonth(@Req() req) {
    return this.questionService.getQuestionsAndAnswersPerMonth(req);
  }

  @UseGuards(new RoleGuard('super-admin'))
  @Get('questionsAndAnswersPerLevel')
  async getQuestionsAndAnswersPerLevel(@Req() req) {
    return this.questionService.getQuestionsAndAnswersPerLevel(req);
  }

  @UseGuards(new RoleGuard('super-admin'))
  @Get('questionsAndAnswersPerSubject')
  async getQuestionsAndAnswersPerSubject(@Req() req) {
    return this.questionService.getQuestionsAndAnswersPerSubject(req);
  }

  @UseGuards(new RoleGuard('super-admin'))
  @Get('count')
  async getQuestionsAndAnswersCountPerPeriod(@Req() req) {
    return Promise.all([
      this.questionService.getQuestionsPerPeriod(req),
      this.questionService.getAnswersPerPeriod(req),
    ]);
  }

  @UseGuards(new RoleGuard('student'))
  @Post()
  addQuestion(
    @Body(new ValidationPipe()) addQuestionDto: AddQuestionDto,
    @Req() req,
  ) {
    return this.questionService.addQuestion(addQuestionDto, req.user.id);
  }

  @UseGuards(new RoleGuard('student'))
  @Put(':id')
  async editQuestion(
    @Param('id') id: string,
    @Body(new ValidationPipe()) addQuestionDto: AddQuestionDto,
  ) {
    return this.questionService.editQuestion(addQuestionDto, id);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Post('answer')
  async addAnswer(@Body() addAnswerDto: AddAnswerDto, @Req() req) {
    return this.questionService.addAnswer(addAnswerDto, req.user.id);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Delete('/answer')
  async deleteAnswer(@Query() query: { id: string }) {
    return this.questionService.deleteAnswer(query.id);
  }

  @UseGuards(new RoleGuard('student'))
  @Delete('/question')
  async deleteQuestion(@Query() query: { id: string }) {
    return this.questionService.deleteQuestion(query.id);
  }

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Get(':id')
  async getQuestion(@Param('id') id: string) {
    return this.questionService.getQuestion(id);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Get('answers/:id')
  async getAnswer(@Param('id') id: string) {
    return this.questionService.getAnswer(id);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Put('answers/:id')
  async editAnswer(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: EditAnswerDto,
  ) {
    return this.questionService.editAnswer(dto, id);
  }

  @UseGuards(new RoleGuard(['student', 'teacher', 'super-admin']))
  @Get()
  async getQuestions(@Query() query: QuestionQueryParams, @Req() req) {
    return this.questionService.getQuestions(query, req.user);
  }

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Post('/comment')
  async addComment(@Body(new ValidationPipe()) addCommentDto: AddCommentDto) {
    return this.questionService.addComment(addCommentDto);
  }

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Delete('/comment')
  async deleteComment(@Query() query: { id: string }) {
    return this.questionService.deleteComment(query.id);
  }

  @UseGuards(new RoleGuard(['student', 'teacher']))
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return this.questionService.uploadImage(file);
  }
}
