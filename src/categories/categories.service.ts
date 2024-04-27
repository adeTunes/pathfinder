import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    const categoriesCount = await this.prisma.biodata.groupBy({
      where: {user: {role: Role.MENTOR}},
      by: ['industry'],
      _count: {
        industry: true,
      },
    });

    return categoriesCount.reduce((acc, { industry, _count }) => {
      if (industry)
        acc.push({
          industry,
          count: _count.industry,
        });
      return acc;
    }, [] as any[]);
  }
}
