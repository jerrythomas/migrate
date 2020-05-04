const path = require('path')
const config = require('config')

const Ajv = require('ajv')
const AutoLoad = require('fastify-autoload')
const FastifyNoIcon = require('fastify-no-icon')
const FastifySensible = require('fastify-sensible')
const FastifyCompress = require('fastify-compress')
const FastifySwagger = require('fastify-swagger')
const UnderPressure = require('under-pressure')
const FastifyRedis = require('fastify-redis')
const FastifyMetrics = require('fastify-metrics')
const FastifyMysql = require('fastify-mysql')
const FastifyPostgres = require('fastify-postgres')

const validators = require('./common/validators')

function addDatabase (fastify, connectionInfo) {
  switch (connectionInfo.database) {
    case 'mysql':
      fastify.register(FastifyMysql, connectionInfo)
      break
    case 'postgres':
      fastify.register(FastifyPostgres, connectionInfo)
      break
    default:
      // todo: unsupported. should raise error
      break
  }
}

function configureAjv (fastify) {
  const ajv = new Ajv({
    // the fastify defaults
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    nullable: true
    // any other options
    // ...
  })
  Object.keys(validators).forEach((keyword) => {
    ajv.addKeyword(keyword, {
      validate: validators[keyword],
      errors: true
    })
  })

  fastify.setSchemaCompiler((schema) => ajv.compile(schema))
}

function pluginOptions () {
  const options = {
    swagger: { ...config.get('swagger') },
    health: { ...config.get('health') },
    metrics: {
      endpoint: '/metrics'
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    source: {
      promise: true,
      database: process.env.SOURCE_DB,
      name: 'source',
      connectionString: process.env.SOURCE_DB_URL
    },
    target: {
      // promise: true,
      database: process.env.TARGET_DB,
      name: 'target',
      connectionString: process.env.TARGET_DB_URL
    }
  }

  return options
}

module.exports = function app (fastify, opts, next) {
  // config returns a read only object
  const NODE_ENV = process.env.NODE_ENV || 'dev'

  // || config.get('source.connectionString')

  const options = pluginOptions()
  // Load external plugins
  fastify.register(FastifyNoIcon)
  fastify.register(FastifySensible)
  fastify.register(FastifyCompress)
  fastify.register(FastifySwagger, options.swagger)
  fastify.register(UnderPressure, options.health)
  fastify.register(FastifyRedis)//, options.redis)

  configureAjv(fastify)
  addDatabase(fastify, options.source)
  addDatabase(fastify, options.target)

  // prom client uses some internal registry which is conflicted in parallel test runs
  if (NODE_ENV !== 'test') {
    fastify.register(FastifyMetrics, options.metrics)
  }

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts }
  })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: { ...opts }
  })
  // Make sure to call next when done
  // Autoloaded decorations are only called at end even if they are written sequentially here

  next()
}
