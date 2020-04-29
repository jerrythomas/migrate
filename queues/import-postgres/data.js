const { getSchema } = require('../../common/functions');

async function importData(fastify, job, done) {
  const errors = fastify.validateSchema(getSchema('data').importSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    // insert data into table

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
  queue: 'import-postgres',
  task: 'data',
  handler: importData,
};
