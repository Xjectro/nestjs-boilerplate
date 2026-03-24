import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function setupLogging(app: NestFastifyApplication) {
  app.useLogger(app.get(ConsoleSeqLogger));
}
