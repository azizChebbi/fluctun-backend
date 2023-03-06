import { IsNotEmpty } from 'class-validator';

export class EditAnswerDto {
  @IsNotEmpty()
  description: string;
}
