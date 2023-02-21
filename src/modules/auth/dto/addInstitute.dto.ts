import { IsNotEmpty } from 'class-validator';

export class AddInstituteDto {
  @IsNotEmpty()
  name: string;
  logo: string;
  @IsNotEmpty()
  verified: boolean;
}
