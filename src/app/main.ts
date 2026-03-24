import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@/app/app.module';
import { setupErrorHandling } from './bootstrap/errors';
import { setupInterceptors } from './bootstrap/interceptors';
import { setupLogging } from './bootstrap/logger';
import { setupSecurity } from './bootstrap/security';
import { setupSwagger } from './bootstrap/swagger';
import { setupValidation } from './bootstrap/validation';

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  await setupSecurity(app);
  setupValidation(app);
  setupSwagger(app);
  setupErrorHandling(app);
  setupLogging(app);
  setupInterceptors(app);

  /** Application Startup */
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
