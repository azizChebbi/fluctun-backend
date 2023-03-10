import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RoleGuard } from 'src/modules/auth/role.guard';
import { DocumentsService } from './documents.service';
import { AddDocumentDto } from './dto/addDocument.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @UseGuards(new RoleGuard(['student', 'super-admin']))
  @Get('subjects')
  async getSubjects(@Req() req) {
    return this.documentsService.getSubjects(req.user.instituteId);
  }

  @UseGuards(new RoleGuard(['teacher', 'super-admin']))
  @Get('levels')
  async getLevels(@Req() req) {
    return this.documentsService.getLevels(req.user.instituteId);
  }

  @UseGuards(new RoleGuard('teacher'))
  @Post('/add-document')
  @UseInterceptors(FileInterceptor('file'))
  async addDocument(
    @Body(new ValidationPipe()) dto: AddDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.addDocument(dto, file);
  }
}
