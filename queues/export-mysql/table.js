const { merge, pick } = require('lodash')
const jq = require('node-jq')
const { table } = require('../../models')
const messages = require('../../common/messages')
const { ValidationError } = require('../../lib/errors')

// function cleanupKeys(item, pattern='') {
//   let modified = {}
//   Object.entries(item).map(([key, value]) => {
//     modified[key.toLowerCase().replace(pattern,'')] = value
//   })
//   return modified
// }
//
// function transform(row) {
//   // const modified = data.map((item) => {
//   //   let row = item
//     row.key = cleanupKeys(row.key, 'column_');
//     row.columns = cleanupKeys(row.columns, 'column_');
//     return row
//   // })
// }

async function exportTable (fastify, job) { // }, done) {
  const { database } = fastify.mapping.source
  const db = fastify[database].source
  const queries = fastify.scripts.sql[database]

  const jobs = []
  const errors = fastify.validateSchema(table.exportSchema, job.data)

  if (errors.length > 0) {
    throw new ValidationError(messages.UNEXPECTED_FORMAT, job.data, errors)
  }

  const opts = { priority: job.opts.priority }
  const [columns] = await db.query(queries.columns, [job.data.schema, job.data.table])
  const [key] = await db.query(queries.key, [job.data.schema, job.data.table])
  const [indexes] = await db.query(queries.indexes, [job.data.schema, job.data.table])
  let result = merge({ columns, key, indexes }, job.data)

  // clean up key names
  result = await jq.run(fastify.scripts.jq.table,
    JSON.stringify(result),
    { input: 'string', output: 'json' })

  let submitted = await fastify.queues[fastify.mapping.importQueue]
    .add('table', result, opts)

  if (process.env.NODE_ENV === 'test') {
    jobs.push(pick(submitted, ['name', 'data', 'opts.priority', 'queue.name']))
  }

  opts.priority += 1
  submitted = await fastify.queues[fastify.mapping.exportQueue]
    .add('data', job.data, opts)
  if (process.env.NODE_ENV === 'test') {
    jobs.push(pick(submitted, ['name', 'data', 'opts.priority', 'queue.name']))
  }

  opts.priority += 1
  submitted = await fastify.queues[fastify.mapping.exportQueue]
    .add('references', job.data, opts)
  if (process.env.NODE_ENV === 'test') {
    jobs.push(pick(submitted, ['name', 'data', 'opts.priority', 'queue.name']))
  }

  return { status: 'ok', jobs, warnings: errors }
}

module.exports = {
  queue: 'export-mysql',
  task: 'table',
  handler: exportTable
}
