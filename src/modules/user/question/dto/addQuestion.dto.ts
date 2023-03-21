import { IsNotEmpty, Length, MaxLength, MinLength } from 'class-validator';

export class AddQuestionDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  question: string;
  @IsNotEmpty()
  @MinLength(10)
  description: string;
  @IsNotEmpty()
  subject: string;
}
