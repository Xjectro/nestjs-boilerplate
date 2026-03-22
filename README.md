<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Docker & Seq

Bundle and run the API in containers to match production closely and forward structured logs to
[Seq](https://datalust.co/seq).

### Build an image

```bash
docker build -t nestjs-boilerplate .
```

### Run the container

```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/turtles" \
  -e SEQ_SERVER_URL="http://host.docker.internal:5341" \
  -e SEQ_API_KEY="your-seq-api-key" \
  nestjs-boilerplate
```

### Full stack via Docker Compose

```bash
docker compose up --build
```

Compose spins up four services:

- `mongodb` with a `mongo-data` volume
- `tests` which blocks the rest of the stack until `npm run test && npm run test:e2e` succeed
- `api` which runs the production build once tests pass
- `seq` (UI on [http://localhost:8081](http://localhost:8081), ingestion on
  [http://localhost:5341](http://localhost:5341))

### Environment variables

| Variable                   | Default                             | Purpose                                                                                          |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `PORT`                     | `3000`                              | Internal NestJS port exposed by the container.                                                   |
| `MONGODB_URI`              | `mongodb://127.0.0.1:27017/turtles` | Connection string consumed by `MongooseModule.forRoot`.                                          |
| `REDIS_URL`                | `redis://127.0.0.1:6379`            | Redis connection string leveraged by the global cache and readiness checks.                      |
| `CACHE_TTL`                | `5`                                 | Default cache entry lifetime in seconds.                                                         |
| `SEQ_SERVER_URL`           | unset                               | HTTP endpoint of your Seq instance. When unset, only console logging is used.                    |
| `SEQ_API_KEY`              | unset                               | Optional ingestion API key if your Seq server requires authentication.                           |
| `SEQ_MIN_LEVEL`            | `Information`                       | Minimum level forwarded to Seq (`Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`). |
| `THROTTLE_TTL`             | `60`                                | Duration in seconds for which throttling limits are calculated.                                  |
| `THROTTLE_LIMIT`           | `100`                               | Maximum number of requests per IP within the throttling window.                                  |
| `HEALTH_HEAP_THRESHOLD_MB` | `150`                               | Max Node.js heap (in MB) before `/health` reports unhealthy.                                     |
| `HEALTH_RSS_THRESHOLD_MB`  | `300`                               | Max RSS (in MB) before `/health` reports unhealthy.                                              |

Set these variables in a `.env` file or export them before running `docker compose` to customize the
stack for each environment.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can
take to ensure it runs as efficiently as possible. Check out the
[deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out
[Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau
makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building
features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video
  [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few
  clicks.
- Visualize your application graph and interact with the NestJS application in real-time using
  [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official
  [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and
  [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official
  [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the
amazing backers. If you'd like to join them, please
[read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
