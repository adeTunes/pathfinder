import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ResourceType, Role, User } from '@prisma/client';

@Controller()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('courses')
  async getAllCourses() {
    return this.resourcesService.getAllResources('course');
  }
  @Get('articles')
  async getAllArticles() {
    return this.resourcesService.getAllResources('article');
  }
  @UseGuards(JwtGuard)
  @Post('courses')
  async createCourse(
    @Body() createResourceDto: CreateResourceDto,
    @GetUser() user: User,
  ) {
    if (user.role !== Role.MENTOR)
      throw new ForbiddenException('Invalid Request');
    return this.resourcesService.createResource(
      createResourceDto,
      user.id,
      ResourceType.course,
    );
  }
  @UseGuards(JwtGuard)
  @Post('articles')
  async createArticle(
    @Body() createResourceDto: CreateResourceDto,
    @GetUser() user: User,
  ) {
    if (user.role !== Role.MENTOR)
      throw new ForbiddenException('Invalid Request');
    return this.resourcesService.createResource(
      createResourceDto,
      user.id,
      ResourceType.article,
    );
  }
}
