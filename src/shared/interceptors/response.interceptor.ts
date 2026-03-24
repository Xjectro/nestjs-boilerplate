import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NestFastifyRequest } from '@/libs/http/request';
import { ApiSuccessResponse } from '@/libs/http/response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<NestFastifyRequest>();

    if (!this.shouldWrap(request)) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => this.toEnvelope(request, data)));
  }

  private toEnvelope(request: NestFastifyRequest | undefined, data: unknown): ApiSuccessResponse {
    return {
      success: true,
      data,
      path: request?.url ?? '',
      timestamp: new Date().toISOString(),
      requestId: request?.id,
    };
  }

  private shouldWrap(request: NestFastifyRequest | undefined) {
    if (!request) {
      return true;
    }

    if (this.isMetricsRoute(request)) {
      return false;
    }

    const acceptHeader = this.normalizeAcceptHeader(request.headers?.accept);
    if (!acceptHeader) {
      return true;
    }

    if (acceptHeader.includes('application/json')) {
      return true;
    }

    if (acceptHeader.includes('*/*')) {
      return true;
    }

    return false;
  }

  private normalizeAcceptHeader(raw: string | string[] | undefined) {
    if (Array.isArray(raw)) {
      return raw.join(',').toLowerCase();
    }

    return raw?.toLowerCase();
  }

  private isMetricsRoute(request: NestFastifyRequest) {
    const configuredPath = (process.env.PROMETHEUS_METRICS_PATH ?? 'metrics').replace(/^\/+/u, '');
    const metricsPath = `/${configuredPath}`.replace(/\/+$/u, '');
    const currentPath = (request.url?.split('?')[0] ?? '').replace(/\/+$/u, '');
    const knownRoutePath = (request as { route?: { path?: string } }).route?.path;
    const normalizedRoutePath = knownRoutePath?.replace(/\/+$/u, '');
    return currentPath === metricsPath || normalizedRoutePath === metricsPath;
  }
}
