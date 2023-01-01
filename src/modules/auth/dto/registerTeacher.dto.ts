import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterTeacherDto {
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
  @IsNotEmpty()
  subject: string;
  @IsNotEmpty()
  @IsBoolean()
  isAdmin: boolean;
}
