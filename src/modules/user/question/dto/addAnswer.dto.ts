import { IsNotEmpty } from 'class-validator';

export class AddAnswerDto {
  @IsNotEmpty()
  details: string;
  @IsNotEmpty()
  questionId: string;
}
