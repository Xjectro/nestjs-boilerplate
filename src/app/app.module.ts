import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { HealthModule } from '@/modules/health/health.module';
import { TurtleModule } from '@/modules/turtle/turtle.module';
import { LoggerModule } from '@/shared/logging/logger.module';
import { MonitoringModule } from '@/shared/monitoring/monitoring.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/turtles'),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const ttlSeconds = Number(process.env.CACHE_TTL ?? 5);
        const ttl = ttlSeconds * 1000;
        const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

        try {
          const store = await redisStore({
            url: redisUrl,
          });

          return {
            store,
            ttl,
          };
        } catch (error) {
          console.warn(
            `Redis connection failed (${redisUrl}). Falling back to in-memory cache.`,
            error,
          );
          return {
            ttl,
          };
        }
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60),
        limit: Number(process.env.THROTTLE_LIMIT ?? 100),
      },
    ]),

    /** Modules */
    TurtleModule,
    HealthModule,

    /** Shared Modules */
    LoggerModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
