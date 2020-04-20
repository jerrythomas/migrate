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

The yaml configurations can be used to identify the source and the target. The source database type can be specified using the `protocol` attribute. The `connectionString` attribute specifies the environment variable which will be used for connecting to the appropriate databases.

```yaml
source:
  database: mysql
  connectionString: SOURCE_DB_URL

target:
  database: postgres
  connectionString: TARGET_DB_URL

```

### Environment Variables

* CLUSTER_SIZE: Control the number of nodes in the cluster. The default is to use the number of cores available.
* REDIS_HOST: Host for Redis
* REDIS_PORT: Port for Redis
* SOURCE_DB_URL: Database connection url for source
* TARGET_DB_URL: Database connection url for target

```bash
TARGET_DB_URL=postgres://user@localhost/databse
SOURCE_DB_URL=mysql://user:password@localhost/database
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
#CLUSTER_SIZE=2
```

## Running

```bash
npm run cluster
```

### Monitor

The progress can be tracked using Grafana dashboards.

### Notes

* Coverage of 100% does not mean that all scenarios are tested. It just means that every line of code is executed during one test or other.
* I have no idea how to test `cluster.js`. 
