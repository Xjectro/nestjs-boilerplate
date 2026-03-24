import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ResponseInterceptor } from '@/shared/interceptors/response.interceptor';
import { LoggingInterceptor } from '@/shared/logging/logging.interceptor';

export function setupInterceptors(app: NestFastifyApplication) {
  app.useGlobalInterceptors(app.get(LoggingInterceptor), new ResponseInterceptor());
}
