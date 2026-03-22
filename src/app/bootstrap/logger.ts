import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LoggingInterceptor } from '@/shared/logging/logging.interceptor';

export function setupLogging(app: NestFastifyApplication) {
  app.useLogger(app.get(ConsoleSeqLogger));
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
}
