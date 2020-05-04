const jq = require('node-jq')
const { pick } = require('lodash')
const { schema } = require('../../models')
const { ValidationError } = require('../../lib/errors')
const { priorities } = require('../../common/constants')

/**
 * Finds difference of two arrays and returns the difference with a message for each item
 *
 * @param {Array} a - Array to be compared to
 * @param {Array} b - Array to be compared with
 * @param {string} message - message to be shown for the difference
 */
function diff (a, b, message) {
  const result = a.filter(name => !b.includes(name))
  const info = []
  result.forEach((name) => {
    info.push(`${name}: ${message}`)
  })
  return info
}

/**
 * Send groups of table items to the the queue. Each item in group is added to the queue
 * with a lower priority than the previous group. First group gets the default priority
 * for table task
 *
 * @param {FastifyInstance} fastify - Instance of fastify
 * @param {Array} groups - Array of groups of table items
 */
async function sendTableGroups (fastify, groups) {
  const groupDetails = await groups.map(async (group) => {
    const priority = priorities.table + group.priority
    const actions = await group.tables.map(async (item) => {
      const info = await fastify.queues[fastify.mapping.exportQueue]
        .add(item.object,
          item,
          { priority })
      return pick(info, ['queue.name', 'name', 'data', 'opts.priority'])
    })
    return Promise.all(actions)
  })

  return Promise.all(groupDetails)
}

/**
 * Process a queue task for exportin a list of schemas.
 * with a lower priority than the previous group. First group gets the default priority
 * for table task
 *
 * @param {FastifyInstance} fastify - Instance of fastify
 * @param {Job} job - Bull job information
 */
async function exportSchemas (fastify, job) {
  const { database } = fastify.mapping.source
  const db = fastify[database].source
  const queries = fastify.scripts.sql[database]

  let jobs = []
  let errors = fastify.validateSchema(schema.exportSchema, job.data)

  if (errors.length > 0) {
    throw new ValidationError('Input data does not match expected format.', job.data, errors)
  }

  const [rows] = await db.query(queries.tables, [job.data.names])

  const result = await jq.run(fastify.scripts.jq.group_by_priority,
    JSON.stringify(rows),
    { input: 'string', output: 'json' })

  if (result.schema.names.length === 0) {
    throw new ValidationError('Nothing to export matching schemas', job.data)
  }

  errors = errors.concat(diff(job.data.names, result.schema.names, 'does not contain any tables to export'))
  errors = errors.concat(diff(result.schema.names, job.data.names, 'has referenced tables which will be exported'))

  result.schema.names = [...new Set([...result.schema.names, ...job.data.names])]

  let jobDetail = await fastify.queues[fastify.mapping.importQueue]
    .add(result.schema.object,
      result.schema,
      { priority: priorities.schema })

  const groupDetails = await sendTableGroups(fastify, result.groups, priorities)

  if (process.env.NODE_ENV === 'test') {
    jobDetail = pick(jobDetail, ['queue.name', 'name', 'data', 'opts.priority'])
    jobs.push(jobDetail)
    jobs.push(groupDetails.flat())
    jobs = jobs.flat()
  }
  return { status: 'ok', warnings: errors, jobs }
}

module.exports = {
  queue: 'export-mysql',
  task: 'schema',
  handler: exportSchemas
}
