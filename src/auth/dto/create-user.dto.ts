import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum Role {
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;
}
