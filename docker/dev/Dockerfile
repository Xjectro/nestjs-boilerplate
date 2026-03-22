# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY nest-cli.json tsconfig*.json ./

CMD ["npm", "run", "start:dev"]
