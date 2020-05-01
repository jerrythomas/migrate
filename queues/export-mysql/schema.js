const jq = require('node-jq');
const { pick } = require('lodash');
const { schema } = require('../../models');
const ValidationError = require('../../common/errors');
const { priorities } = require('../../common/constants');


async function exportSchemas(fastify, job) {
  const { database } = fastify.mapping.source;
  const db = fastify[database].source;
  const queries = fastify.scripts.sql[database];

  let jobs = [];
  const errors = fastify.validateSchema(schema.exportSchema, job.data);

  if (errors.length > 0) {
    throw new ValidationError('Input data does not match expected format.', { errors });
  }

  // try {

  const [rows] = await db.query(queries.tables, [job.data.names]);

  const result = await jq.run(fastify.scripts.jq.group_by_priority,
    JSON.stringify(rows),
    { input: 'string', output: 'json' });
    // let result = transform(rows)

  if (result.schema.names.length === 0) {
    throw new ValidationError('Nothing to export matching schemas', { schemas: job.data.names });
  }

  const missing = job.data.names.filter((name) => !result.schema.names.includes(name));
  missing.forEach((name) => {
    errors.push(`"${name}" does not contain any tables to export`);
  });

  const extra = result.schema.names.filter((name) => !job.data.names.includes(name));
  extra.forEach((name) => {
    errors.push(`"${name}" has referenced tables which will be exported.`);
  });

  result.schema.names = [...new Set([...result.schema.names, ...job.data.names])];
  // check additional names and send warning
  let jobDetail = await fastify.queues[fastify.mapping.importQueue]
    .add(result.schema.object,
      result.schema,
      { priority: priorities.schema });

  const groups = await result.groups.map(async (group) => {
    const priority = priorities.table + group.priority;
    const actions = await group.tables.map(async (item) => {
      const info = await fastify.queues[fastify.mapping.exportQueue]
        .add(item.object,
          item,
          { priority });
      return pick(info, ['queue.name', 'name', 'data', 'opts.priority']);
    });
    return Promise.all(actions);
  });

  const groupDetails = await Promise.all(groups);

  if (process.env.NODE_ENV === 'test') {
    jobDetail = pick(jobDetail, ['queue.name', 'name', 'data', 'opts.priority']);
    jobs.push(jobDetail);
    jobs.push(groupDetails.flat());
    jobs = jobs.flat();
  }
  return { status: 'ok', warnings: errors, jobs };
}

module.exports = {
  queue: 'export-mysql',
  task: 'schema',
  handler: exportSchemas,
};
