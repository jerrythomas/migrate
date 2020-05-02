https://travis-ci.org/jerrythomas/migrate.svg?branch=master
[![Coverage Status](https://coveralls.io/repos/github/jerrythomas/migrate/badge.svg)](https://coveralls.io/github/jerrythomas/migrate)
![David](https://img.shields.io/david/jerrythomas/migrate)
[![Known Vulnerabilities](https://snyk.io/test/github/jerrythomas/migrate/badge.svg)](https://snyk.io/test/github/jerrythomas/migrate)

# Migrate database

Migrating from one database to another is a difficult task. This reposiitory is an experimental implementation that attempts to do this using a combination of [fastify](https://www.fastify.io/) & [bull](https://optimalbits.github.io/bull/).

This application uses fastify for providing rest apis for migration. The api's in turn push tasks into bull queues and the workers process the data to perform the export and import activities.

To perform migration there is a source database and a target database. Objects from source are exported and passed on as tasks for import. The aim is to support migration between mysql, sqlite, mssql and postgres.

Application currently provides support for migration between the following

| Source | Target   | Notes |
|--------|----------|-------|
| mysql  | postgres |       |

## Setup

```bash
git clone https://github.com/jerrythomas/migrate
cd migrate
yarn install
```

## Application configuration

Application is configuration driven and the following configurations need to be set before launching the app.

### YAML Configurtion

The config folder contains the application default configurations.

### Environment Variables

* CLUSTER_SIZE: Control the number of nodes in the cluster. The default is to use the number of cores available.
* REDIS_HOST: Host for Redis
* REDIS_PORT: Port for Redis
* SOURCE_DB: Dialect for the source database
* TARGET_DB: Dialect for the target database
* SOURCE_DB_URL: Database connection url for source
* TARGET_DB_URL: Database connection url for target
* QUEUE_CONCURRENCY: number of concurrent tasks per queue

```bash
TARGET_DB=postgres
TARGET_DB_URL=postgres://user@localhost/databse
SOURCE_DB=mysql
SOURCE_DB_URL=mysql://user:password@localhost/database
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CLUSTER_SIZE=2
QUEUE_CONCURRENCY=1
```

## Running

```bash
npm run cluster
```

### To Do

* Configure tracking health using Grafana dashboards. Might be possible to track queue status using Grafana.
* Add data and references export processors for mysql
* Add import processors for postgres.
* Move common code to `lib`
* Restructure tests to use docker images for databases
* Add Travis integration
* Add badges to readme.

### Notes

* I have no idea how to test `cluster.js`.
* `nyc 14.x` is incompatible with `node-jq`. Added `nyc 15` as dev dependency
* `fastify-mysql` in promise mode does not release connection. This causes tap tests to timeout
* Tests depend on environment variables. load `.env` before running tests
