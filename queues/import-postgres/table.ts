async function importTable(fastify, job, done) {

}

module.exports = {
  queue: 'import-postgres',
  task: 'table',
  handler: importTable,
};
