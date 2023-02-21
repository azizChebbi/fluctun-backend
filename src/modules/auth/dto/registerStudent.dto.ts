import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterStudentDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  level: string;
  @IsNotEmpty()
  @IsString()
  @Length(8, 8, { message: 'cin must be equal to 8 digits' })
  @Matches(/^[0-9]*$/, { message: 'cin should contain only numbers' })
  code: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsMongoId()
  instituteId: string;
}
