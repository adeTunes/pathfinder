import {
  IsArray,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestSessionDto {
  @IsString()
  @IsNotEmpty()
  dateScheduled: string;

  @IsNotEmpty()
  @IsNumber()
  mentorId: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsString()
  @IsNotEmpty()
  timeScheduled: string;

  @IsArray()
  @IsOptional()
  expectations: string[];

  @IsArray()
  @IsOptional()
  questions: string[];

  @IsString()
  @IsOptional()
  message: string;
}
