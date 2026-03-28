import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { Response } from 'supertest';
import { AppModule } from '@/app/app.module';
import { setupErrorHandling } from '@/app/bootstrap/errors';
import { setupInterceptors } from '@/app/bootstrap/interceptors';
import { setupLogging } from '@/app/bootstrap/logger';
import { setupSecurity } from '@/app/bootstrap/security';
import { setupSwagger } from '@/app/bootstrap/swagger';
import { setupValidation } from '@/app/bootstrap/validation';

type TurtleResponse = {
  id: string;
  _id?: string;
  name: string;
  species: string;
  age: number;
  slug: string;
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
  path: string;
  timestamp: string;
  requestId?: string | number;
};

type ApiErrorPayload = {
  success: false;
  errorCode: string;
  message: string;
  path: string;
  timestamp: string;
  requestId?: string | number;
  details?: unknown;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTurtleResponse = (payload: unknown): payload is TurtleResponse =>
  isPlainObject(payload) &&
  typeof payload.id === 'string' &&
  typeof payload.name === 'string' &&
  typeof payload.species === 'string' &&
  typeof payload.age === 'number' &&
  typeof payload.slug === 'string';

const assertTurtleResponse = (payload: unknown): TurtleResponse => {
  if (!isTurtleResponse(payload)) {
    throw new Error('Turtle payload has an unexpected shape.');
  }
  return payload;
};

const assertTurtleResponseList = (payload: unknown): TurtleResponse[] => {
  if (!Array.isArray(payload) || !payload.every(isTurtleResponse)) {
    throw new Error('Turtle list payload has an unexpected shape.');
  }
  return payload;
};

const assertSuccessPayload = <T>(payload: unknown): ApiSuccessPayload<T> => {
  if (!isPlainObject(payload)) {
    throw new Error('Response payload must be an object.');
  }

  if (payload.success !== true) {
    throw new Error('Response payload is not a success envelope.');
  }

  if (!('data' in payload)) {
    throw new Error('Success payload must include data.');
  }

  if (typeof payload.path !== 'string') {
    throw new Error('Success payload path must be a string.');
  }

  if (typeof payload.timestamp !== 'string') {
    throw new Error('Success payload timestamp must be a string.');
  }

  return payload as ApiSuccessPayload<T>;
};

const assertErrorPayload = (payload: unknown): ApiErrorPayload => {
  if (!isPlainObject(payload)) {
    throw new Error('Error payload must be an object.');
  }

  if (payload.success !== false) {
    throw new Error('Error payload must have success=false.');
  }

  if (typeof payload.errorCode !== 'string') {
    throw new Error('Error payload must include an error code.');
  }

  if (typeof payload.message !== 'string') {
    throw new Error('Error payload must include a message.');
  }

  if (typeof payload.path !== 'string' || typeof payload.timestamp !== 'string') {
    throw new Error('Error payload must include path and timestamp.');
  }

  return payload as ApiErrorPayload;
};

describe('TurtleController (e2e)', () => {
  let app: NestFastifyApplication;

  const nextIdempotencyKey = (() => {
    let counter = 0;
    return () => `test-idem-${++counter}`;
  })();

  const createTurtle = async (
    overrides: Partial<{ name: string; species: string; age: number; slug: string }> = {},
  ): Promise<TurtleResponse> => {
    const payload = {
      name: 'Leonardo',
      species: 'Green Sea Turtle',
      age: 15,
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/turtle')
      .set('sign', nextIdempotencyKey())
      .send(payload)
      .expect(201);

    const envelope = assertSuccessPayload<TurtleResponse>(response.body as unknown);
    return assertTurtleResponse(envelope.data);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await setupSecurity(app);
    setupValidation(app);
    setupSwagger(app);
    setupErrorHandling(app);
    setupLogging(app);
    setupInterceptors(app);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects turtle creation without an idempotency key', async () => {
    await request(app.getHttpServer())
      .post('/turtle')
      .send({ name: 'Raph', species: 'Loggerhead', age: 12 })
      .expect(400)
      .expect((res: Response) => {
        const body = assertErrorPayload(res.body as unknown);
        expect(body.message).toBe('Idempotency key missing');
        expect(body.errorCode).toBe('BAD_REQUEST');
      });
  });

  it('creates a turtle when idempotency key is provided', async () => {
    const payload = { name: 'Mikey', species: 'Box Turtle', age: 13 };

    const response = await request(app.getHttpServer())
      .post('/turtle')
      .set('sign', nextIdempotencyKey())
      .send(payload)
      .expect(201);

    const envelope = assertSuccessPayload<TurtleResponse>(response.body as unknown);
    const turtle = assertTurtleResponse(envelope.data);

    expect(turtle).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: payload.name,
        species: payload.species,
        age: payload.age,
        slug: expect.any(String),
      }),
    );
  });

  it('returns turtles when requesting the list endpoint', async () => {
    await createTurtle({ name: 'Donnie' });
    await createTurtle({ name: 'Raph' });

    const response = await request(app.getHttpServer()).get('/turtle').expect(200);
    const envelope = assertSuccessPayload<TurtleResponse[]>(response.body as unknown);
    const turtles = assertTurtleResponseList(envelope.data);

    expect(turtles.length > 0).toBe(true);
  });

  it('fetches a turtle by id', async () => {
    const turtle = await createTurtle({ name: 'April' });

    const response = await request(app.getHttpServer()).get(`/turtle/${turtle.id}`).expect(200);
    const envelope = assertSuccessPayload<TurtleResponse | null>(response.body as unknown);
    const fetchedTurtle = envelope.data ? assertTurtleResponse(envelope.data) : null;

    expect(fetchedTurtle).toEqual(
      expect.objectContaining({
        id: turtle.id,
        name: 'April',
        species: turtle.species,
        age: turtle.age,
        slug: expect.any(String),
      }),
    );
  });

  it('updates a turtle and returns the fresh entity', async () => {
    const turtle = await createTurtle({ name: 'Casey', species: 'Snapping' });

    const response = await request(app.getHttpServer())
      .patch(`/turtle/${turtle.id}`)
      .send({ id: turtle.id, name: 'Casey Jones', age: 21 })
      .expect(200);
    const envelope = assertSuccessPayload<TurtleResponse>(response.body as unknown);
    const updatedTurtle = assertTurtleResponse(envelope.data);

    expect(updatedTurtle).toEqual(
      expect.objectContaining({
        id: turtle.id,
        name: 'Casey Jones',
        age: 21,
        slug: expect.any(String),
      }),
    );
  });

  it('rejects duplicate slugs with a clear error code', async () => {
    const slug = 'unique-turtle';
    await createTurtle({ name: 'Alpha', slug });

    await request(app.getHttpServer())
      .post('/turtle')
      .set('sign', nextIdempotencyKey())
      .send({ name: 'Bravo', species: 'Test Species', age: 2, slug })
      .expect(409)
      .expect((res: Response) => {
        const payload = assertErrorPayload(res.body as unknown);
        expect(payload.errorCode).toBe('UNIQUE_SLUG');
        expect(payload.message).toBe('Slug already exists.');
      });
  });

  it('removes a turtle and confirms deletion', async () => {
    const turtle = await createTurtle({ name: 'Slash' });

    await request(app.getHttpServer())
      .delete(`/turtle/${turtle.id}`)
      .expect(200)
      .expect((res: Response) => {
        const envelope = assertSuccessPayload<boolean>(res.body as unknown);
        expect(envelope.data).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/turtle/${turtle.id}`)
      .expect(404)
      .expect((res: Response) => {
        const error = assertErrorPayload(res.body as unknown);
        expect(error.errorCode).toBe('NOT_FOUND');
        expect(error.message).toBe('Turtle not found.');
      });
  });
});
