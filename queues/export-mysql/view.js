const { view } = require('../../models');

async function exportView(fastify, job, done) {
  const errors = fastify.validateSchema(view.exportSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    const importQueue = `import-${fastify.mapping.target.database}`;

    // try fetch. Capture errors and push into errors array.

    // fetch view details
    const data = {};
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
  task: 'view',
  handler: exportView,
};
