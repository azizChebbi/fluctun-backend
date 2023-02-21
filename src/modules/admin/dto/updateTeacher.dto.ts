import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateTeacherDto {
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
  @Length(8, 8, { message: 'cin must be equal to 8 digits' })
  @Matches(/^[0-9]*$/, { message: 'cin should contain only numbers' })
  cin: string;
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
  subject: string;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(10000000)
  @Max(99999999)
  number: number;
}
