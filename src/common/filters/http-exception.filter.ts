import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { ErrorStatus } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode: number;
    let message: string;
    let errorStatus: ErrorStatus;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse = exception.getResponse() as {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };

      if (Array.isArray(errorResponse?.message)) {
        message = errorResponse.message.join(', ');
        errorStatus = ErrorStatus.VALIDATION_ERROR;
      } else {
        message = errorResponse?.message || exception.message;
        errorStatus = this.getErrorStatusByHttpStatus(statusCode);
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      errorStatus = ErrorStatus.INTERNAL_ERROR;

      this.logger.error(
        `未处理的异常: ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
        `${request.method} ${request.url}`,
      );
    }

    this.logger.warn(
      `HTTP异常: ${statusCode} - ${message}`,
      `${request.method} ${request.url}`,
    );

    const errorResponse = ResponseUtil.error(message, errorStatus);

    response.status(statusCode).json(errorResponse);
  }

  private getErrorStatusByHttpStatus(statusCode: number): ErrorStatus {
    if (statusCode === 400) {
      return ErrorStatus.BAD_REQUEST;
    }
    if (statusCode === 401) {
      return ErrorStatus.UNAUTHORIZED;
    }
    if (statusCode === 403) {
      return ErrorStatus.FORBIDDEN;
    }
    if (statusCode === 404) {
      return ErrorStatus.NOT_FOUND;
    }
    return ErrorStatus.INTERNAL_ERROR;
  }
}
