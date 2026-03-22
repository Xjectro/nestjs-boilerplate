import helmet from '@fastify/helmet';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function setupSecurity(app: NestFastifyApplication) {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
}
