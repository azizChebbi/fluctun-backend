import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { ObjectId } from 'mongodb';
import { AddCommentDto } from './dto/addComment.dto';

@UseGuards(JwtAuthGuard)
@Controller('questions')
@ApiTags('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(new RoleGuard('student'))
  @Post()
  addQuestion(
    @Body(new ValidationPipe()) addQuestionDto: AddQuestionDto,
    @Req() req,
  ) {
    return this.questionService.addQuestion(addQuestionDto, req.user.id);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Post('answer')
  async addAnswer(@Body() addAnswerDto: AddAnswerDto, @Req() req) {
    return this.questionService.addAnswer(addAnswerDto, req.user.id);
  }

  @Get(':id')
  async getQuestion(@Param('id') id: string) {
    return this.questionService.getQuestion(id);
  }

  @Get()
  async getQuestions(@Query() query: QuestionQueryParams, @Req() req) {
    return this.questionService.getQuestions(query, req.user);
  }

  @Post('/comment')
  async addComment(@Body(new ValidationPipe()) addCommentDto: AddCommentDto) {
    return this.questionService.addComment(addCommentDto);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return this.questionService.uploadImage(file);
  }
}
