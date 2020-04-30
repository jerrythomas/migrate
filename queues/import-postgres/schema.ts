async function importSchemas(fastify, job, done) {

}

module.exports = {
  queue: 'import-postgres',
  task: 'schema',
  handler: importSchemas,
};
