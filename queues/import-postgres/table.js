const { getSchema } = require('../../common/functions');

function convertTypes(data){
  return data
}

function getTableCreationScript(data){
  let script = '';
  let
  return script;
}

function getIndexCreationScript(data){
  let script = '';
  return script;
}

function getForeignKeyCreationScript(data){
  let script = '';
  return script;
}

function getPrimaryKeyCreationScript(data){
  let script = '';
  return script;
}

function executeScripts(fastify, script, action){

}

async function importTable(fastify, job, done) {
  const errors = fastify.validateSchema(getSchema('table').importSchema, job.data);

  try {
    if (errors.length > 0) {
      throw new Error('Invalid data');
    }
    let scripts = {
      table: getTableCreationScript(job.data),
      index: getIndexCreationScript(job.data),
      primaryKey: getPrimaryKeyCreationScript(job.data),
      foreignKey: getForeignKeyCreationScript(job.data)
    }
    try {
      fastify.pg.target.query(scripts['table'])
    } catch (err){
      errors.push(`While creating ${action} got error ${err.message}`);
    }
    ['table', 'index', 'primaryKey', 'foreignKey'].forEach((action) => {
      try {
        fastify.pg.target.query(scripts[action])
      } catch (err){
        errors.push(`While creating ${action} got error ${err.message}`);
      }
    });


    scripts.forEach((script) => {

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
  queue: 'import-postgres',
  task: 'table',
  handler: importTable,
};
