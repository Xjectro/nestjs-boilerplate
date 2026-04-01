import { SeqLogger } from '@jasonsoft/nestjs-seq';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

export function setupErrorHandling(app: NestFastifyApplication) {
  const logger = app.get(SeqLogger);
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
}
