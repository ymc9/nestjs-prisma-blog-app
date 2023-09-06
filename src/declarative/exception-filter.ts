import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * An exception filter that converts Prisma errors to proper HTTP responses.
 */
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'P2004') {
      // denied by access policy
      response.status(403).json({
        code: exception.code,
        message: exception.message,
      });
    } else {
      // other errors
      response.status(500).json({
        code: exception.code,
        message: exception.message,
      });
    }
  }
}
