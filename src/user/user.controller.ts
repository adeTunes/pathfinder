import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUser(@GetUser() user: User) {
    return user;
  }

  @Patch()
  updateProfile(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateProfile(updateUserDto, user);
  }
  @Post('verify-email')
  verifyCode(
    @Body() verifyCodeDto: VerifyCodeDto,
    @GetUser('id') userId: number,
  ) {
    return this.userService.verifyCode(verifyCodeDto, userId);
  }
}
