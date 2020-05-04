const cleanup = require('./cleanup')

/**
 * Process a queue task for exportin a list of schemas.
 * with a lower priority than the previous group. First group gets the default priority
 * for table task
 *
 * @param {FastifyInstance} fastify - Instance of fastify
 * @param {Job} job - Bull job information
 */
async function setup (fastify, version) {
  const { database } = fastify.mapping.source
  const db = fastify[database].source
  const ddl = fastify.scripts.ddl[database]

  if (version < 8) {
    await cleanup(fastify, version)
    await db.query(ddl.create.export_session)
    await db.query(ddl.create.export_tables)
    await db.query(ddl.create.get_tables)
  }

  return { status: 'ok' }
}

module.exports = setup
