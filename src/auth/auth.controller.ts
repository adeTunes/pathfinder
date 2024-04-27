import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';

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
}
