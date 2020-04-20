
const fp = require('fastify-plugin');
const config = require('config');
// const messages = require('../common/messages');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(function mapping(fastify, opts, next) {
  // if (!fastify.redis) {
  //   throw Error(messages.MISSING_REDIS_PLUGIN);
  // }

  fastify.decorate('mapping', {
    source: {
      database: config.get('source.database'),
      url: process.env[config.get('source.connectionString')],
    },
    target: {
      database: config.get('target.database'),
      url: process.env[config.get('target.connectionString')],
    },
  });

  next();
});
