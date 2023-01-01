import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddQuestionDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  details: string;
  @IsNotEmpty()
  subject: string;
}
