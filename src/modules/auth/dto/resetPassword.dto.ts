import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
  @IsNotEmpty()
  @IsString()
  token: string;
  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;
  @IsNotEmpty()
  @IsString()
  @Length(8)
  passwordConfirmation: string;
}
