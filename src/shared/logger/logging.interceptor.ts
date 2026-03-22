import { SeqLogger } from '@jasonsoft/nestjs-seq';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: SeqLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    const requestContext = {
      method: request.method,
      context: 'RouterRequest',
      url: url,
      requestId: request.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `Completed {${url}, ${method}} route ${Date.now() - now}ms`,
          requestContext,
        );
      }),
    );
  }
}
