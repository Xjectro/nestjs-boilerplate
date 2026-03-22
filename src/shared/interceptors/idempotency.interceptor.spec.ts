import { BadRequestException, ConflictException, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { IdempotencyInterceptor } from './idempotency.interceptor';

type MockCache = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

const createMockContext = (headers: Record<string, string> = {}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

const createMockHandler = (payload: unknown = { ok: true }) => ({
  handle: jest.fn(() => of(payload)),
});

describe('IdempotencyInterceptor', () => {
  let cache: MockCache;
  let interceptor: IdempotencyInterceptor;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    interceptor = new IdempotencyInterceptor(cache as any);
  });

  it('throws when idempotency key missing', async () => {
    await expect(
      interceptor.intercept(createMockContext(), createMockHandler()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns cached response when present', async () => {
    cache.get.mockResolvedValueOnce({ cached: true });

    const result = await lastValueFrom(
      await interceptor.intercept(
        createMockContext({ 'sign': 'abc' }),
        createMockHandler(),
      ),
    );

    expect(result).toEqual({ cached: true });
    expect(cache.get).toHaveBeenCalledWith('idempotency:abc');
  });

  it('throws conflict when lock exists', async () => {
    cache.get.mockResolvedValueOnce(null).mockResolvedValueOnce(true);

    await expect(
      interceptor.intercept(createMockContext({ 'sign': 'abc' }), createMockHandler()),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('caches successful responses and removes lock', async () => {
    cache.get.mockResolvedValue(null);

    await lastValueFrom(
      await interceptor.intercept(
        createMockContext({ 'sign': 'abc' }),
        createMockHandler({ ok: true }),
      ),
    );

    expect(cache.set).toHaveBeenCalledWith('idempotency:abc:lock', true, 10 * 1000);
    expect(cache.set).toHaveBeenCalledWith('idempotency:abc', { ok: true }, 300 * 1000);
    expect(cache.del).toHaveBeenCalledWith('idempotency:abc:lock');
  });
});
