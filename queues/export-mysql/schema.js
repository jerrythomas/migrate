const { schema } = require('../../models');
const ValidationError = require('../../common/errors');
const jq = require('node-jq');

async function exportSchemas(fastify, job) { //, done) {
  const database = fastify.mapping.source.database
  const db = fastify[database].source
  const queries = fastify.scripts.sql[database]

  let jobs = []
  let errors = fastify.validateSchema(schema.exportSchema, job.data);

  if (errors.length > 0) {
    throw new ValidationError('Input data does not match expected format.', {errors});
  }

  // try {

    let [rows] = await db.query(queries.tables, [job.data.names]);

    let result = await jq.run(fastify.jq.group_by_priority,
                              JSON.stringify(rows),
                              { input: 'string' , output: 'json'});
    //let result = transform(rows)

    if (result.schema.names.length === 0){
      throw new ValidationError('Nothing to export matching schemas', {schemas: job.data.names})
    }

    let missing = job.data.names.filter(name => !result.schema.names.includes(name));
    missing.forEach((name) => {
      errors.push(`"${name}" does not contain any tables to export`)
    });

    let extra = result.schema.names.filter(name => !job.data.names.includes(name));
    extra.forEach((name) => {
      errors.push(`"${name}" has referenced tables which will be exported.`)
    });

    result.schema.names = [...new Set([...result.schema.names, ...job.data.names])]
    // check additional names and send warning
    let {name, data, opts} = await fastify.queues[fastify.mapping.importQueue]
                                          .add(result.schema.object,
                                               result.schema,
                                               {priority: fastify.priorities.schema})

    if (process.env.NODE_ENV === 'test'){
      opts = {priority: opts.priority};
      jobs.push({name, data, opts})
    }

    await result.groups.map(async (group) => {
      let priority = fastify.priorities.table + group.priority

      await group.tables.map(async (item) => {
        let {name, data, opts} = await fastify.queues[fastify.mapping.exportQueue]
                                              .add(item.object, item, {priority: priority})

        if (process.env.NODE_ENV === 'test'){
          opts = {priority: opts.priority};
          jobs.push({name, data, opts})
        }
      })
    });

    //done(null, {status:'ok', warnings: errors, jobs})
    return {status:'ok', warnings: errors, jobs};
  // } catch (error) {
  //     done(error, {status: 'failed', errors})
  //   return {status: 'failed', errors};
  // }
}

module.exports = {
  queue: 'export-mysql',
  task: 'schema',
  handler: exportSchemas,
};
