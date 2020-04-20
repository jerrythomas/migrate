const path = require('path');
const config = require('config');
const Ajv = require('ajv');
const AutoLoad = require('fastify-autoload');
const FastifyNoIcon = require('fastify-no-icon');
const FastifySensible = require('fastify-sensible');
const FastifyCompress = require('fastify-compress');
const FastifySwagger = require('fastify-swagger');
const UnderPressure = require('under-pressure');
const FastifyRedis = require('fastify-redis');
const FastifyMetrics = require('fastify-metrics');
const { merge } = require('lodash');
const validators = require('./common/validators');

module.exports = function app(fastify, opts, next) {
  // config returns a read only object
  const NODE_ENV = process.env.NODE_ENV || 'dev';
  const ajv = new Ajv({
    // the fastify defaults
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
    nullable: true,
    // any other options
    // ...
  });

  const options = {
    swagger: { ...config.get('swagger') },
    health: { ...config.get('health') },
    metrics: {
      endpoint: '/metrics',
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  };
  // Load external plugins
  fastify.register(FastifyNoIcon);
  fastify.register(FastifySensible);
  fastify.register(FastifyCompress);
  fastify.register(FastifySwagger, options.swagger);
  fastify.register(UnderPressure, options.health);
  fastify.register(FastifyRedis, options.redis);

  Object.keys(validators).forEach((keyword) => {
    ajv.addKeyword(keyword, {
      validate: validators[keyword],
      errors: true,
    });
  });

  fastify.setSchemaCompiler((schema) => ajv.compile(schema));

  // fastify.schemaCompiler = function (schema) {
  //   return ajv.compile(schema);
  // };

  // prom client uses some internal registry which is conflicted in parallel test runs
  if (NODE_ENV !== 'test') {
    fastify.register(FastifyMetrics, options.metrics);
  }

  // add additional options for custom plugins
  const pluginOpts = merge(opts, { validators });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...pluginOpts },
  });

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: { ...opts },
  });
  // Make sure to call next when done
  // Autoloaded decorations are only called at end even if they are written sequentially here
  next();
};
