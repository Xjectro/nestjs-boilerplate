import { SeqLogger } from '@jasonsoft/nestjs-seq';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { NestFastifyRequest } from '@/libs/http/request';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: SeqLogger) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<NestFastifyRequest>();
    const { method, url, id, ip, headers } = request;

    const requestContext = {
      method,
      context: 'RouterRequest',
      url,
      requestId: id,
      ip,
      userAgent: headers['user-agent'],
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
