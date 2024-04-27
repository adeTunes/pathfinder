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
  @IsDateString()
  @IsNotEmpty()
  dateScheduled: Date;

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
