const { getSchema } = require('../../common/functions');

async function importSchema(fastify, job, done) {
  const errors = fastify.validateSchema(getSchema('schema').importSchema, job.data);
  // try import and catch errors
  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    // create schema using data

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
  task: 'schema',
  handler: importSchema,
};
