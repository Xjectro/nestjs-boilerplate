import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';

describe('TurtleController (e2e)', () => {
  let app: INestApplication<App>;

  const nextIdempotencyKey = (() => {
    let counter = 0;
    return () => `test-idem-${++counter}`;
  })();

  const createTurtle = async (
    overrides: Partial<{ name: string; species: string; age: number }> = {},
  ) => {
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

    return response.body;
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
      .expect(({ body }) => {
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

    expect(response.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: payload.name,
        species: payload.species,
        age: payload.age,
      }),
    );
  });

  it('returns turtles when requesting the list endpoint', async () => {
    const turtleOne = await createTurtle({ name: 'Donnie' });
    const turtleTwo = await createTurtle({ name: 'Raph' });

    const response = await request(app.getHttpServer()).get('/turtle').expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: turtleOne._id, name: 'Donnie' }),
        expect.objectContaining({ _id: turtleTwo._id, name: 'Raph' }),
      ]),
    );
  });

  it('fetches a turtle by id', async () => {
    const turtle = await createTurtle({ name: 'April' });

    const response = await request(app.getHttpServer()).get(`/turtle/${turtle._id}`).expect(200);

    expect(response.body).toEqual(
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

    expect(response.body).toEqual(
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
      .expect((res) => {
        const responseWasTrue = typeof res.body === 'boolean' ? res.body : res.text === 'true';
        expect(responseWasTrue).toBe(true);
      });

    const followUp = await request(app.getHttpServer()).get(`/turtle/${turtle._id}`).expect(200);

    const bodyIsEmpty =
      followUp.body === null ||
      (typeof followUp.body === 'object' &&
        followUp.body !== null &&
        Object.keys(followUp.body).length === 0);
    expect(bodyIsEmpty).toBe(true);
  });
});
