import { Availability, DaysType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  levelOfExpertise?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailableData)
  availability?: AvailableData[];
}

class AvailableData {
  @IsNumber()
  @IsNotEmpty()
  timeAvailable: number;

  @IsEnum(DaysType)
  @IsNotEmpty()
  dayAvailable: DaysType;

  @IsOptional()
  timeRemainingForSchedule?: number;

  @IsOptional()
  lastDateScheduled?: Date;
}
