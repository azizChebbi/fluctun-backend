import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterAdmindto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  instituteId: string;
}
