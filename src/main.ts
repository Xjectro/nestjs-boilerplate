import helmet from '@fastify/helmet';
import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { LoggingInterceptor } from './shared/logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  /** Security Configuration */
  await app.register(helmet, { contentSecurityPolicy: false });

  /** Validation Configuration */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /** Swagger Configuration */
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('The NestJS Boilerplate API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  /** Logger Configuration */
  app.useLogger(app.get(ConsoleSeqLogger));
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  /** Application Startup */
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
