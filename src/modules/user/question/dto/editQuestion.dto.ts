import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class EditQuestionDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  question: string;
  @IsNotEmpty()
  @MinLength(20)
  description: string;
  @IsNotEmpty()
  subject: string;
}
