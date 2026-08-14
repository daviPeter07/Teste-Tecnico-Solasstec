import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface NormalizedException {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const normalized = this.normalize(exception);

    if (normalized.statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.path}: ${normalized.message}`,
        stack,
      );
    }

    response.status(normalized.statusCode).json({
      ...normalized,
      timestamp: new Date().toISOString(),
      path: request.path,
    });
  }

  private normalize(exception: unknown): NormalizedException {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      };
    }

    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return {
        statusCode,
        code: this.statusCodeToCode(statusCode),
        message: payload,
      };
    }

    if (!this.isRecord(payload)) {
      return {
        statusCode,
        code: this.statusCodeToCode(statusCode),
        message: exception.message,
      };
    }

    const code =
      this.readString(payload, 'code') ?? this.statusCodeToCode(statusCode);
    const responseMessage = payload.message;

    if (Array.isArray(responseMessage)) {
      return {
        statusCode,
        code,
        message: 'Request validation failed.',
        details: responseMessage,
      };
    }

    return {
      statusCode,
      code,
      message:
        (typeof responseMessage === 'string' && responseMessage) ||
        exception.message,
      details: payload.details,
    };
  }

  private readString(
    payload: Record<string, unknown>,
    property: string,
  ): string | undefined {
    const value = payload[property];
    return typeof value === 'string' ? value : undefined;
  }

  private isRecord(value: object): value is Record<string, unknown> {
    return Object.getPrototypeOf(value) === Object.prototype;
  }

  private statusCodeToCode(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'HTTP_ERROR';
  }
}
