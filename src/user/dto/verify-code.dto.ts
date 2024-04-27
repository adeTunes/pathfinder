import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyCodeDto {
  @IsNumber()
  @IsNotEmpty()
  otp: number;
}
