import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TraditionalController } from './traditional/traditional.controller';
import { PrismaService } from './prisma.service';
import { DeclarativeController } from './declarative/declarative.controller';
import { ClsModule } from 'nestjs-cls';
import { CrudMiddleware } from './zen/crud.middleware';
import { EnhancedPrismaService } from './declarative/enhanced-prisma.service';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: {
        mount: true,
        setup: (cls, req) => {
          const userId = req.headers['x-user-id'];
          const userRole = req.headers['x-user-role'] ?? 'USER';
          cls.set(
            'user',
            userId ? { id: Number(userId), role: userRole } : undefined,
          );
        },
      },
    }),
  ],
  controllers: [TraditionalController, DeclarativeController],
  providers: [PrismaService, EnhancedPrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CrudMiddleware).forRoutes('/api/zen');
  }
}
