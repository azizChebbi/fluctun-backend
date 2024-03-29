import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class RegisterTeacherDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Length(8, 8, { message: 'cin must be equal to 8 digits' })
  @Matches(/^[0-9]*$/, { message: 'cin should contain only numbers' })
  cin: string;
  @IsNotEmpty()
  @Length(3)
  firstName: string;
  @IsNotEmpty()
  @Length(3)
  lastName: string;
  @IsNotEmpty()
  instituteId: string;
  @IsNotEmpty()
  subject: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(10000000)
  @Max(99999999)
  number: number;
}
