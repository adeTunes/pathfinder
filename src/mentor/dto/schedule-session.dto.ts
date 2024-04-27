import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SceduleSessionDto {
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  mentorId: number;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsArray()
  @IsOptional()
  expectations: string[]

  @IsArray()
  @IsOptional()
  questions: string[]

  @IsString()
  @IsOptional()
  message: string
}
