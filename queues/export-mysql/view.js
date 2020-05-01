async function exportView(fastify, job, done) {
  done();
}

module.exports = {
  queue: 'export-mysql',
  task: 'view',
  handler: exportView,
};
