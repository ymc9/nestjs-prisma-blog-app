import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { Post as PostModel, User as UserModel } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { EnhancedPrismaService } from './enhanced-prisma.service';
import { PrismaExceptionFilter } from './exception-filter';

@Controller({ path: 'api/decl' })
@UseFilters(new PrismaExceptionFilter())
export class DeclarativeController {
  constructor(
    private readonly enhancedPrisma: EnhancedPrismaService,
    private readonly clsService: ClsService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.enhancedPrisma.post.findUnique({ where: { id: Number(id) } });
  }

  @Get('post')
  async getFilteredPosts(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ): Promise<PostModel[]> {
    const searchFilter = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {};

    return this.enhancedPrisma.post.findMany({
      where: searchFilter,
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    });
  }

  @Get('user')
  async getAllUsers(): Promise<UserModel[]> {
    return this.enhancedPrisma.user.findMany();
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string },
  ): Promise<PostModel> {
    const { title, content } = postData;
    const user: { id: number } | undefined = this.clsService.get('user');
    return this.enhancedPrisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: { id: user?.id },
        },
      },
    });
  }

  @Post('signup')
  async signupUser(
    @Body()
    userData: {
      name?: string;
      email: string;
    },
  ): Promise<UserModel> {
    return this.enhancedPrisma.user.create({
      data: {
        name: userData?.name,
        email: userData.email,
      },
    });
  }

  @Put('publish/:id')
  async togglePublishPost(@Param('id') id: string): Promise<PostModel> {
    const postData = await this.enhancedPrisma.post.findUnique({
      where: { id: Number(id) },
      select: { published: true },
    });

    return this.enhancedPrisma.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.enhancedPrisma.post.delete({ where: { id: Number(id) } });
  }
}
