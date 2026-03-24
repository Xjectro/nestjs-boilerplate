import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

export function setupErrorHandling(app: NestFastifyApplication) {
  app.useGlobalFilters(new GlobalExceptionFilter());
}
