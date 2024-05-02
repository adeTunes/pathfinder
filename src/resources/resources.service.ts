import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceType } from '@prisma/client';
import { getRequiredFields } from 'src/helpers/get-resource-fields';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async createResource(
    createResourceDto: CreateResourceDto,
    userId: number,
    type: ResourceType,
  ) {
    const resource = await this.prisma.resources.create({
      data: { ...createResourceDto, userId, type },
      select: {
        id: true,
        ...getRequiredFields(type),
        user: {
          select: {
            email: true,
            biodata: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    resource['owner'] = {
      email: resource.user.email,
      name: resource.user.biodata.name,
    };
    delete resource.user;
    return resource;
  }

  async getAllUserResources(userId: number) {
    const resources = await this.prisma.resources.findMany({
      where: { userId },
    });
    return resources;
  }
  
  async getAllResources(type: ResourceType) {
    const resources = await this.prisma.resources.findMany({
      where: { type },
      select: {
        id: true,
        ...getRequiredFields(type),
        user: {
          select: {
            email: true,
            id: true,
            biodata: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return resources.map((item) => {
      const result = {
        ...item,
        owner: {
          id: item.user.id,
          name: item.user.biodata.name,
          email: item.user.email,
        },
      };
      delete result.user;
      return result;
    });
  }
}
