import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

interface ErrorPayload {
  status: number;
  message: string;
  detail: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const errorPayload = this.extractErrorPayload(exception);

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${errorPayload.status} - Error: ${errorPayload.message}`,
    );

    response.status(errorPayload.status).send({
      error: errorPayload.message,
      detail: errorPayload.detail || 'Operation failed',
      status: 'FAILURE',
    });
  }

  private extractErrorPayload(exception: unknown): ErrorPayload {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : res.message || res.error || 'Internal Server Error';
      const detail =
        typeof res === 'object' && res.detail ? res.detail : exception.message;

      return { status, message, detail };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        detail: exception.stack,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      detail: 'A system-level exception occurred. Please contact administrator.',
    };
  }
}
