import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { GetUser } from './decorators/get-user.decorator';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  signin(@Body() signDto: SigninDto) {
    return this.authService.signin(signDto);
  }

  @UseGuards(JwtGuard)
  @Patch('resend-otp')
  resendOtp(@GetUser('id') userId: number) {
    return this.authService.resendOTP(userId);
  }
}
