import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
  @IsNotEmpty()
  token: string;
}
