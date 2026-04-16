import helmet from '@fastify/helmet';
import { ConsoleSeqLogger, SeqLogger } from '@jasonsoft/nestjs-seq';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import type { EnvConfig } from '@/common/config';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  /** Security */
  await app.register(helmet, { contentSecurityPolicy: false });

  /** Validation */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /** Swagger */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('The NestJS Boilerplate API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  /** Error Handling */
  const seqLogger = app.get(SeqLogger);
  app.useGlobalFilters(new GlobalExceptionFilter(seqLogger));

  /** Logging */
  app.useLogger(app.get(ConsoleSeqLogger));

  /** Interceptors */
  app.useGlobalInterceptors(app.get(LoggingInterceptor), app.get(ResponseInterceptor));

  /** Graceful Shutdown */
  app.enableShutdownHooks();

  /** Start */
  const config = app.get(ConfigService<EnvConfig, true>);
  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
}
