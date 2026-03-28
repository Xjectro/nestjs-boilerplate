# NestJS Boilerplate

> A production-ready NestJS 11 service template that ships with Fastify, MongoDB, Redis caching,
> rate limiting, structured logging, observability, and Docker-first workflows.

## Feature Highlights

- **Fastify-powered HTTP layer** with hardened security headers (Helmet), global validation pipes,
  and an auto-generated Swagger UI exposed at `/docs`.
- **Opinionated module layout** (`health`, `turtle`, shared logging/monitoring) that separates
  application, domain, infrastructure, and presentation layers.
- **MongoDB + Redis** wired through `MongooseModule` and `CacheModule` (automatic fallback to
  in-memory caching when Redis is unavailable).
- **Cross-cutting concerns baked in:** logging interceptor that streams to Seq, metrics interceptor,
  throttling guard, and idempotency utilities.
- **Full Docker Compose stack** with MongoDB, Redis, Seq, Prometheus, Grafana, and dedicated images
  for dev, staging, prod, and test workflows.
- **CI-ready** via GitHub Actions (`docker-tests` workflow) that runs the dockerized unit + e2e
  suite just like local developers do.

## Architecture Overview

### Application bootstrap

- `src/main.ts` simply re-exports `bootstrap()` from `src/app/main.ts` to keep the entry-point
  minimal.
- `bootstrap()` spins up a `NestFastifyApplication`, registers security/validation/swagger/logging
  helpers, and listens on `PORT` (default `3000`).

### App module (`src/app/app.module.ts`)

- Connects to MongoDB using `MONGODB_URI` and enables caching via `cache-manager-redis-yet` with TTL
  driven by `CACHE_TTL`.
- Adds a `ThrottlerGuard` globally (window + limit configured through env vars).
- Imports domain modules (`TurtleModule`, `HealthModule`) plus shared infrastructure
  (`LoggerModule`, `MonitoringModule`).

### Bootstrap helpers (`src/app/bootstrap/*`)

- `logger.ts`: binds the `ConsoleSeqLogger` and a global `LoggingInterceptor` for structured logs.
- `security.ts`: registers Helmet with CSP disabled (suitable for APIs).
- `swagger.ts`: exposes OpenAPI docs named "NestJS Boilerplate" at `/docs`.
- `validation.ts`: enforces DTO shape with `ValidationPipe` (whitelisting + transformation).

### Domain modules

- **Turtle Module** (`src/app/modules/turtle`): showcases the layered approach (application
  service + DTOs, domain entity schema, cache + persistence repositories, HTTP controller).
- **Health Module** (`src/app/modules/health`): exposes readiness/liveness endpoints backed by
  MongoDB, Redis, and custom indicators.

### Shared modules & libs

- `src/app/shared/logging`: central logging module + interceptor configured for Seq.
- `src/app/shared/monitoring`: Prometheus metrics module and interceptors.
- `src/app/shared/interceptors/idempotency.interceptor.ts` and `src/app/libs/http/idempotency.ts`:
  reusable HTTP idempotency utilities.
- `src/app/libs/cache`: cache key helpers reused across repositories/services.

## Repository Layout

```
├── docker/
│   ├── compose.{base,dev,staging,prod,test}.yml
│   ├── images/api/Dockerfile.{dev,prod,staging,test}
│   └── grafana + prometheus provisioning
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── main.ts (bootstrap)
│   │   ├── bootstrap/ (logger, security, swagger, validation)
│   │   ├── modules/
│   │   │   ├── health/
│   │   │   └── turtle/
│   │   └── shared/ (logging, monitoring, interceptors)
│   └── app/libs/ (cache + http helpers)
├── test/
│   └── turtle.e2e-spec.ts
├── Makefile
└── .github/workflows/docker-tests.yml
```

## Getting Started

### Prerequisites

- Node.js ≥ 20 (the Docker images use Node 22-slim).
- npm 10+
- Docker Desktop (or compatible engine) for the compose stacks.

### Install dependencies

```bash
npm install
```

### Run the API

```bash
# development (watch)
npm run start:dev

# production build
npm run build && npm run start:prod
```

### Environment configuration

1. Create a `.env` file at the repository root.
2. Provide MongoDB/Redis credentials plus the optional Seq/Prometheus settings below.
3. `npm run start:dev` reads values from your shell; `docker compose` loads them from the root
   `.env` file.

## Make Targets

The `Makefile` wraps every docker compose flow so CI and developers use the same commands:

| Target                               | Description                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make test`                          | Builds the test image and runs unit + e2e tests (`npm run test && npm run test:e2e`) in compose, automatically tearing everything down afterward. |
| `make dev`                           | Bring up or tear down the dev stack (API + MongoDB + Redis + Seq + observability tooling).                                                        |
| `make staging` / `make staging-down` | Run the staging config in detached mode.                                                                                                          |
| `make prod` / `make prod-down`       | Run the production compose file in detached mode.                                                                                                 |
| `make help`                          | Lists every documented target.                                                                                                                    |

## Docker & Observability Stack

`docker/compose.base.yml` defines the core services shared by all environments:

- **MongoDB 7** with persistent `mongo-data` volume.
- **Redis 7** plus an exporter consumed by Prometheus.
- **Seq** (HTTP on `8081`, ingestion on `5341`) for structured logs emitted by the logging
  interceptor.
- **Prometheus + Grafana** pre-configured via the files under `docker/prometheus` and
  `docker/grafana`.

Environment-specific files extend the base stack:

- `compose.dev.yml`, `compose.staging.yml`, `compose.prod.yml`: choose the appropriate API
  Dockerfile and runtime flags.
- `compose.test.yml`: adds the `tests` service that blocks until all tests pass.

## Testing Strategy

```bash
npm run lint        # ESLint with Prettier integration
npm run test        # unit tests
npm run test:e2e    # e2e suite under test/jest-e2e.json
npm run test:cov    # coverage report
make test           # dockerized tests + dependencies
```

The dockerized suite is the source of truth for CI and mirrors production by running tests against
real MongoDB/Redis containers.

## Environment Variables

| Variable                   | Default                             | Purpose                                                     |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `PORT`                     | `3000`                              | Fastify listen port.                                        |
| `MONGODB_URI`              | `mongodb://127.0.0.1:27017/turtles` | Connection string consumed by `MongooseModule`.             |
| `REDIS_URL`                | `redis://127.0.0.1:6379`            | Cache + health indicator connection string.                 |
| `CACHE_TTL`                | `5`                                 | Cache TTL in seconds.                                       |
| `SEQ_SERVER_URL`           | _unset_                             | Seq ingestion endpoint; when unset logs stay in stdout.     |
| `SEQ_API_KEY`              | _unset_                             | Seq API key if authentication is enabled.                   |
| `SEQ_MIN_LEVEL`            | `Information`                       | Minimum log level forwarded to Seq.                         |
| `THROTTLE_TTL`             | `60`                                | Rate-limiting window in seconds.                            |
| `THROTTLE_LIMIT`           | `100`                               | Requests allowed per IP per window.                         |
| `HEALTH_HEAP_THRESHOLD_MB` | `150`                               | Max heap size before the healthcheck fails.                 |
| `HEALTH_RSS_THRESHOLD_MB`  | `300`                               | Max RSS before the healthcheck fails.                       |
| `E2E_USE_MEMORY_SERVER`    | `false`                             | When `true`, e2e tests rely on an in-memory MongoDB server. |

## Continuous Integration

The workflow in `.github/workflows/tests.yml` runs on every push/PR to `main`:

1. Checks out the repository.
2. Sets up Docker Buildx on `ubuntu-latest`.
3. Executes `make test`, guaranteeing parity with local docker-based testing.

## License

This project is distributed under the MIT License. See `LICENSE` for details.
