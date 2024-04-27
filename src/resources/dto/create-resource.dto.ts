import { ResourceType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverPhoto?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  level?: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsNumber()
  lessons?: number;

  @IsOptional()
  @IsBoolean()
  hasCertifications?: boolean;
}
