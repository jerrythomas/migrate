//const jq = require('node-jq');
const {pick} = require('lodash');
const { table } = require('../../models');
const messages = {
  UNEXPECTED_FORMAT: 'Input data does not match expected format.'
}
function cleanupKeys(item, pattern='') {
  let modified = {}
  Object.entries(item).map(([key, value]) => {
    modified[key.toLowerCase().replace(pattern,'')] = value
  })
  return modified
}

function transform(data) {
  const modified = data.map((item) => {
    let row = item
    row.key = cleanupKeys(row.keys, 'column_');
    row.columns = cleanupKeys(row.columns, 'column_');
    return row
  })
}

async function exportTable(fastify, job) { // }, done) {
  const { database, queries} = fastify.mapping.source
  const db = fastify[database].source
  let jobs = []

  let errors = fastify.validateSchema(table.exportSchema, job.data);

  //try {
    if (errors.length > 0) {
      throw new ValidationError(messages.UNEXPECTED_FORMAT, {errors});
    }
    let sumbitted
    let opts = {priority: job.opts.priority}
    let [columns] = await db.query(queries.columns, [job.data.schema, job.data.table]);
    let [key] = await db.query(queries.key, [job.data.schema, job.data.table]);
    let [indexes] = await db.query(queries.indexes, [job.data.schema, job.data.table]);
    let result = {columns, key, indexes }

    // clean up key names
    // result = await jq.run(fastify.jq.table_data,
    //                           JSON.stringify(result),
    //                           { input: 'string' , output: 'json'});


    submitted = await fastify.queues[fastify.mapping.importQueue]
                             .add('table', result, opts)

    //console.log(submitted)
    if (process.env.NODE_ENV === 'test') {
      jobs.push(pick(submitted, ['name', 'data', 'opts.priority','queue.name']));
    }

    opts.priority += 1
    submitted = await fastify.queues[fastify.mapping.exportQueue]
                                      .add('data', job.data, opts)
    if (process.env.NODE_ENV === 'test') {
      jobs.push(pick(submitted, ['name', 'data', 'opts.priority','queue.name']));
    }

    opts.priority += 1
    submitted = await fastify.queues[fastify.mapping.exportQueue]
                                      .add('references', job.data, opts)
    if (process.env.NODE_ENV === 'test') {
      jobs.push(pick(submitted, ['name', 'data', 'opts.priority','queue.name']));
    }

    //done(null, {status: 'ok', jobs: jobs, warnings: errors})
    return {status: 'ok', jobs: jobs, warnings: errors}
  //} catch (error) {
  //  done(error, {status: 'failed', errors})
  //}
}

module.exports = {
  queue: 'export-mysql',
  task: 'table',
  handler: exportTable
}
