import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from '@/shared/monitoring/metrics.interceptor';

const REQUEST_LABELS: Array<'method' | 'route' | 'status'> = ['method', 'route', 'status'];

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: process.env.PROMETHEUS_METRICS_PATH ?? 'metrics',
    }),
  ],
  providers: [
    MetricsInterceptor,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of incoming HTTP requests',
      labelNames: REQUEST_LABELS,
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: REQUEST_LABELS,
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    }),
    {
      provide: APP_INTERCEPTOR,
      useExisting: MetricsInterceptor,
    },
  ],
  exports: [PrometheusModule],
})
export class MonitoringModule {}
