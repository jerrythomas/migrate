const { getSchema } = require('../../common/functions');

async function importView(fastify, job, done) {
  const errors = fastify.validateSchema(getSchema('view').importSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    // create table using data ;

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
  task: 'view',
  handler: importView,
};
