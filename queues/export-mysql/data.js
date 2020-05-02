async function exportData (fastify, job, done) {
  done()
}

module.exports = {
  queue: 'export-mysql',
  task: 'data',
  handler: exportData
}
