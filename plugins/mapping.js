const fp = require('fastify-plugin')
const config = require('config')
// const messages = require('../common/messages');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

// todo: need to change environment variables to opts.
module.exports = fp(function mapping (fastify, opts, next) {
  const source = process.env.SOURCE_DB
  const target = process.env.TARGET_DB

  fastify.decorate('mapping', {
    source: {
      database: source,
      url: process.env.SOURCE_DB_URL
    },
    target: {
      database: target,
      url: process.env.TARGET_DB_URL
    },
    types: config.get('mapping.types'),
    exportQueue: `export-${source}`,
    importQueue: `import-${target}`
  })

  next()
})
