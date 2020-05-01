async function importData(fastify, job, done) {
  done();
}

module.exports = {
  queue: 'import-postgres',
  task: 'data',
  handler: importData,
};
