import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export function extendPrismaClient() {
  const prisma = new PrismaClient();
  const extendedPrisma = prisma.$extends({
    // adds a prisma.<model>.findById(<number>) method
    model: {
      $allModels: {
        async findById(id: number) {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as any).findUniqueOrThrow({
            where: { id },
          });
          return result;
        },
      },
    },
  });
  return extendedPrisma;
}

export const ExtendedPrismaClient = class {
  constructor() {
    return extendPrismaClient();
  }
} as new () => ReturnType<typeof extendPrismaClient>;

@Injectable()
export class PrismaService
  extends ExtendedPrismaClient
  implements OnModuleInit
{
  async onModuleInit() {
    // Note: this is optional
    await this.$connect();
  }
}
