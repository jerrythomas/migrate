const { data } = require('../../models');

async function exportData(fastify, job, done) {
  const errors = fastify.validateSchema(data.exportSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    const importQueue = `import-${fastify.mapping.target.database}`;

    // streaming fetch from datbase and send to queue
    // fetch view details
    fastify.queues[importQueue].add(job.object, data);

    const result = {
      status: 'ok',
      data: job.data,
    };

    done(null, result);
  } catch (err) {
    done(err, {
      status: 'failed',
      errors,
    });
  }
}

module.exports = {
  queue: 'export-mysql',
  task: 'data',
  handler: exportData,
};
