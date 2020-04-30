async function importView(fastify, job, done) {

}

module.exports = {
  queue: 'import-postgres',
  task: 'view',
  handler: importView,
};
