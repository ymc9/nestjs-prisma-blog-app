import { Injectable, NestMiddleware } from '@nestjs/common';
import { enhance } from '@zenstackhq/runtime';
import RESTHandler from '@zenstackhq/server/api/rest';
import { ZenStackMiddleware } from '@zenstackhq/server/express';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CrudMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}

  use(req: Request, _res: Response, next: (error?: any) => void) {
    // base url for RESTful resource linkage
    const baseUrl = `${req.protocol}://${req.headers.host}${req.baseUrl}`;

    // get user from request
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'] ?? 'USER';
    const user = userId ? { id: Number(userId), role: userRole } : undefined;

    // construct an Express middleware and forward the request/response
    const inner = ZenStackMiddleware({
      // get an enhanced PrismaClient for the current user
      getPrisma: () => enhance(this.prismaService, { user }),
      // use RESTful style API
      handler: RESTHandler({ endpoint: baseUrl }),
    });
    inner(req, _res, next);
  }
}
