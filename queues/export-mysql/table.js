const { table } = require('../../models');

async function exportTable(fastify, job, done) {
  const errors = fastify.validateSchema(table.exportSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    const importQueue = `import-${fastify.mapping.target.database}`;

    // try fetch. Capture errors and push into errors array.

    // fetch columns
    // fetch foreign keys
    // fetch indexes
    // create data payload
    const data = {};
    fastify.queues[importQueue].add(job.object, data);

    fastify.queues['export-mysql'].add('data', {
      object: 'data',
      schema: job.data.schema,
      table: job.data.table,
    });

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
  task: 'table',
  handler: exportTable,
};
