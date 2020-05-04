/**
 * Process a queue task for exportin a list of schemas.
 * with a lower priority than the previous group. First group gets the default priority
 * for table task
 *
 * @param {FastifyInstance} fastify - Instance of fastify
 * @param {Job} job - Bull job information
 */
async function cleanup (fastify, version) {
  const { database } = fastify.mapping.source
  const db = fastify[database].source
  const ddl = fastify.scripts.ddl[database]

  if (version < 8) {
    await db.query(ddl.drop.get_tables)
    await db.query(ddl.drop.export_tables)
    await db.query(ddl.drop.export_session)
  }

  return { status: 'ok' }
}

module.exports = cleanup
