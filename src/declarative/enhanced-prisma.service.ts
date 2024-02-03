import { Injectable } from '@nestjs/common';
import { enhance } from '@zenstackhq/runtime';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma.service';

/**
 * An enhanced wrapper of @see PrismaService that enforces access policies.
 */
@Injectable()
export class EnhancedPrismaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly clsService: ClsService,
  ) {}

  private get enhancedPrisma() {
    // create an enhanced PrismaClient for the user
    return enhance(
      this.prismaService,
      { user: this.clsService.get('user') },
      { logPrismaQuery: true },
    );
  }

  get user() {
    return this.enhancedPrisma.user;
  }
  get post() {
    return this.enhancedPrisma.post;
  }
}
