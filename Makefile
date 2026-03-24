SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

COMPOSE ?= docker compose
COMPOSE_BASE := docker/compose.base.yml
COMPOSE_DEV := docker/compose.dev.yml
COMPOSE_STAGING := docker/compose.staging.yml
COMPOSE_PROD := docker/compose.prod.yml
COMPOSE_TEST := docker/compose.test.yml

COMPOSE_TEST_CMD := $(COMPOSE) -f $(COMPOSE_BASE) -f $(COMPOSE_TEST)
COMPOSE_DEV_CMD := $(COMPOSE) -f $(COMPOSE_BASE) -f $(COMPOSE_DEV)
COMPOSE_STAGING_CMD := $(COMPOSE) -f $(COMPOSE_BASE) -f $(COMPOSE_STAGING)
COMPOSE_PROD_CMD := $(COMPOSE) -f $(COMPOSE_BASE) -f $(COMPOSE_PROD)

.PHONY: help docker-test docker-dev docker-dev-down docker-staging docker-staging-down docker-prod docker-prod-down

help: 
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "} {printf "%-24s %s\n", $$1, $$2}'

docker-test: 
	@trap '$(COMPOSE_TEST_CMD) down --volumes --remove-orphans' EXIT; \
	  $(COMPOSE_TEST_CMD) up --build --abort-on-container-exit --exit-code-from tests

docker-dev: 
	$(COMPOSE_DEV_CMD) up --build

docker-dev-down: 
	$(COMPOSE_DEV_CMD) down --volumes --remove-orphans

docker-staging: 
	$(COMPOSE_STAGING_CMD) up --build -d

docker-staging-down: 
	$(COMPOSE_STAGING_CMD) down -v --remove-orphans

docker-prod: 
	$(COMPOSE_PROD_CMD) up --build -d

docker-prod-down: 
	$(COMPOSE_PROD_CMD) down -v --remove-orphans
