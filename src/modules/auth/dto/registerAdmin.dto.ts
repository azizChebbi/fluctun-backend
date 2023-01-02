import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterAdmindto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  instituteId: string;
}
