import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestContext } from './request-context.service';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
  ],
  providers: [RequestContext, CorrelationIdMiddleware],
  exports: [RequestContext],
})
export class ContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
