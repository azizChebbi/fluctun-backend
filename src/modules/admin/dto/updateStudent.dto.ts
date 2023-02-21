import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateStudentDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(8, 8, { message: 'inscription code must be equal to 8 digits' })
  @Matches(/^[0-9]*$/, {
    message: 'inscription code should contain only numbers',
  })
  code: string;
  @IsOptional()
  @IsNotEmpty()
  @Length(3)
  firstName: string;
  @IsOptional()
  @IsNotEmpty()
  @Length(3)
  lastName: string;
  @IsOptional()
  @IsNotEmpty()
  level: string;
}
