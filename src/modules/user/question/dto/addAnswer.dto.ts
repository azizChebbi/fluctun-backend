import { IsNotEmpty } from 'class-validator';

export class AddAnswerDto {
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  questionId: string;
}
