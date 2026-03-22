import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { Response } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app/app.module';

type TurtleResponse = {
  _id: string;
  name: string;
  species: string;
  age: number;
};

type MessagePayload = {
  message?: string;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTurtleResponse = (payload: unknown): payload is TurtleResponse =>
  isPlainObject(payload) &&
  typeof payload._id === 'string' &&
  typeof payload.name === 'string' &&
  typeof payload.species === 'string' &&
  typeof payload.age === 'number';

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

const assertMessagePayload = (payload: unknown): MessagePayload => {
  if (!isPlainObject(payload)) {
    throw new Error('Response payload is not an object.');
  }

  if (
    'message' in payload &&
    payload.message !== undefined &&
    typeof payload.message !== 'string'
  ) {
    throw new Error('Response payload message must be a string.');
  }

  return payload as MessagePayload;
};

const isEmptyPayload = (payload: unknown): boolean =>
  payload === null || (isPlainObject(payload) && Object.keys(payload).length === 0);

describe('TurtleController (e2e)', () => {
  let app: INestApplication<App>;

  const nextIdempotencyKey = (() => {
    let counter = 0;
    return () => `test-idem-${++counter}`;
  })();

  const createTurtle = async (
    overrides: Partial<{ name: string; species: string; age: number }> = {},
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

    return assertTurtleResponse(response.body as unknown);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('rejects turtle creation without an idempotency key', async () => {
    await request(app.getHttpServer())
      .post('/turtle')
      .send({ name: 'Raph', species: 'Loggerhead', age: 12 })
      .expect(400)
      .expect((res: Response) => {
        const body = assertMessagePayload(res.body as unknown);
        expect(body.message).toBe('Idempotency key missing');
      });
  });

  it('creates a turtle when idempotency key is provided', async () => {
    const payload = { name: 'Mikey', species: 'Box Turtle', age: 13 };

    const response = await request(app.getHttpServer())
      .post('/turtle')
      .set('sign', nextIdempotencyKey())
      .send(payload)
      .expect(201);

    const turtle = assertTurtleResponse(response.body as unknown);

    expect(turtle).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: payload.name,
        species: payload.species,
        age: payload.age,
      }),
    );
  });

  it('returns turtles when requesting the list endpoint', async () => {
    await createTurtle({ name: 'Donnie' });
    await createTurtle({ name: 'Raph' });

    const response = await request(app.getHttpServer()).get('/turtle').expect(200);
    const turtles = assertTurtleResponseList(response.body as unknown);

    expect(turtles.length > 0).toBe(true);
  });

  it('fetches a turtle by id', async () => {
    const turtle = await createTurtle({ name: 'April' });

    const response = await request(app.getHttpServer()).get(`/turtle/${turtle._id}`).expect(200);
    const fetchedTurtle = assertTurtleResponse(response.body as unknown);

    expect(fetchedTurtle).toEqual(
      expect.objectContaining({
        _id: turtle._id,
        name: 'April',
        species: turtle.species,
        age: turtle.age,
      }),
    );
  });

  it('updates a turtle and returns the fresh entity', async () => {
    const turtle = await createTurtle({ name: 'Casey', species: 'Snapping' });

    const response = await request(app.getHttpServer())
      .patch(`/turtle/${turtle._id}`)
      .send({ id: turtle._id, name: 'Casey Jones', age: 21 })
      .expect(200);
    const updatedTurtle = assertTurtleResponse(response.body as unknown);

    expect(updatedTurtle).toEqual(
      expect.objectContaining({
        _id: turtle._id,
        name: 'Casey Jones',
        age: 21,
      }),
    );
  });

  it('removes a turtle and confirms deletion', async () => {
    const turtle = await createTurtle({ name: 'Slash' });

    await request(app.getHttpServer())
      .delete(`/turtle/${turtle._id}`)
      .expect(200)
      .expect((res: Response) => {
        const payload = res.body as unknown;
        const responseIsBoolean = typeof payload === 'boolean' ? payload : res.text === 'true';
        expect(responseIsBoolean).toBe(true);
      });

    const followUp = await request(app.getHttpServer()).get(`/turtle/${turtle._id}`).expect(200);
    const emptyResponse = isEmptyPayload(followUp.body as unknown);

    expect(emptyResponse).toBe(true);
  });
});
