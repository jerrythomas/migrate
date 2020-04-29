const { schema } = require('../../models');

async function exportSchemas(fastify, job, done) {
  const { database, queries} = fastify.mapping.source
  const db = fastify[database].source

  let errors = fastify.validateSchema(schema.exportSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Input data does not match expected format.');
    }
    const [rows] = await db.query(queries.ref_tables, [job.data.names]);
    let result = await jq.run(fastify.jq.group_by_priority,
                                JSON.stringify(rows),
                                { input: 'string' , output: 'json'});

    if (result.schema.names.length === 0){
      throw new Error(`Nothing to export matching schemas ${job.data.names}`)
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

    fastify.queues[fastify.mapping.importQueue]
           .add(result.schema.object,
                result.schema,
                {priority: fastify.priorities.schema})

    result.groups.forEach((group) => {
      let priority = fastify.priorities.table + group.priority
      group.tables.forEach((item) => {
        fastify.queues[fastify.mapping.exportQueue]
               .add(item.object, item, {priority: priority})
      })
    });
    done(null, {status:'ok', warnings: errors})

  } catch (error) {
    done(error, {status: 'failed', errors})
  }
}

module.exports = {
  queue: 'export-mysql',
  task: 'schema',
  handler: exportSchemas,
};
