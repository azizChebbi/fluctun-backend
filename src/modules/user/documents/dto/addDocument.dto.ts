import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddDocumentDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  title: string;
  @IsNotEmpty()
  @MinLength(1)
  levels: string;
  @IsNotEmpty()
  @IsMongoId()
  teacherId: string;
  @IsOptional()
  size: string;
  @IsOptional()
  type: string;
}
