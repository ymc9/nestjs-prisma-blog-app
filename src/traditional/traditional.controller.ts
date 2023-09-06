import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Post as PrismaPost, User as PrismaUser } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma.service';

type UserModel = Omit<PrismaUser, 'email'>;
type PostModel = Omit<PrismaPost, 'author'> & { author?: UserModel };

/**
 * Controller implementation with manually written authorization logic.
 */
@Controller({ path: 'api/trad' })
export class TraditionalController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly clsService: ClsService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    const authFilter = this.makePostAuthFilter();
    return this.prismaService.post.findUnique({
      where: { id: Number(id), ...authFilter },
    });
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

    const authFilter = this.makePostAuthFilter();

    return this.prismaService.post.findMany({
      where: { AND: [searchFilter, authFilter] },
      // make sure to exclude "email" field
      include: { author: { select: { id: true, name: true, role: true } } },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    });
  }

  @Get('user')
  async getAllUsers(): Promise<UserModel[]> {
    return this.prismaService.user.findMany({
      // make sure to exclude "email" field
      select: { id: true, name: true, role: true },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string },
  ): Promise<PostModel> {
    if (!this.currentUser) {
      throw new UnauthorizedException('You must be logged in to create posts');
    }
    const { title, content } = postData;
    return this.prismaService.post.create({
      data: {
        title,
        content,
        author: {
          connect: { id: this.currentUser?.id },
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
    console.log('userData', userData);
    return this.prismaService.user.create({
      data: {
        name: userData?.name,
        email: userData.email,
      },
    });
  }

  @Put('publish/:id')
  async togglePublishPost(@Param('id') id: string): Promise<PostModel> {
    if (this.currentUser?.role !== 'EDITOR') {
      throw new UnauthorizedException(
        'You are not authorized to publish posts',
      );
    }

    const postData = await this.prismaService.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    });

    return this.prismaService.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    if (!this.currentUser) {
      throw new UnauthorizedException('You must be logged in to delete posts');
    }

    if (this.currentUser?.role !== 'EDITOR') {
      const post = await this.prismaService.post.findUniqueOrThrow({
        where: { id: Number(id) },
      });
      if (post.authorId !== this.currentUser.id) {
        throw new UnauthorizedException(
          'You are not authorized to delete this post',
        );
      }
    }
    return this.prismaService.post.delete({ where: { id: Number(id) } });
  }

  private get currentUser(): { id: number; role: string } | undefined {
    return this.clsService.get('user');
  }

  private makePostAuthFilter() {
    // user is editor, or post is published or user is author
    return this.currentUser
      ? this.currentUser.role === 'EDITOR'
        ? {}
        : { OR: [{ published: true }, { author: { id: this.currentUser.id } }] }
      : { published: true };
  }
}
