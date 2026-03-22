import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '@/modules/health/redis.health.indicator';

const bytesFromMb = (value: number) => value * 1024 * 1024;

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    const heapLimit = Number(process.env.HEALTH_HEAP_THRESHOLD_MB ?? 150);
    const rssLimit = Number(process.env.HEALTH_RSS_THRESHOLD_MB ?? 300);

    return this.health.check([
      () => this.memory.checkHeap('memory_heap', bytesFromMb(heapLimit)),
      () => this.memory.checkRSS('memory_rss', bytesFromMb(rssLimit)),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
