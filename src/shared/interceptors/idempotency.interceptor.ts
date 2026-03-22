import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const sign = request.headers['sign'];

    if (!sign) {
      throw new BadRequestException('Idempotency key missing');
    }
    
    const redisKey = `idempotency:${sign}`;
    const lockKey = `${redisKey}:lock`;

    const cached = await this.cacheManager.get(redisKey);
    if (cached) {
      return of(cached);
    }

    const lockExists = await this.cacheManager.get(lockKey);
    if (lockExists) {
      throw new ConflictException('Request already processing');
    }

    await this.cacheManager.set(lockKey, true, 10 * 1000);

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(redisKey, data, 300 * 1000);
        await this.cacheManager.del(lockKey);
      }),
    );
  }
}
