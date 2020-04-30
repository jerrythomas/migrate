async function importData(fastify, job, done) {

}

module.exports = {
  queue: 'import-postgres',
  task: 'data',
  handler: importData,
};
