import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;
  questionId: string;
  answerId: string;
  studentId: string;
  teacherId: string;
}
