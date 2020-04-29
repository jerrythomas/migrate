const fs = require('fs')
const path = require('path')
const fp = require('fastify-plugin');
const config = require('config');
// const messages = require('../common/messages');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope
/**
 * Walk path and return a list of files
 *
 * @param {String} dir - path to be recursively scanned
 */
function walk(dir='.', pattern='.') {
  let filepaths = [];
  const files = fs.readdirSync(dir);

  files.forEach((filename) => {
    const filepath = path.join(dir, filename);

    if (fs.statSync(filepath).isDirectory()) {
      filepaths = filepaths.concat(walk(filepath, pattern));
    } else {
      filepaths.push(filepath);
    }
  });

  return filepaths.filter((file) => file.match(pattern));
}

/**
 * Find all query templates for each database dialect
 *
 * @param {String} dir - path to be recursively scanned
 */
function getQueries(dir = '.'){
  //const files = walk(dir).filter((file) => path.extname(file).match('.sql$'));
  const files = walk(dir, '.sql$')
  const queries = {}

  files.forEach((file) => {
    let dialect = path.dirname(file)
    let name = path.basename(file, path.extname(file))

    queries[dialect] = queries[dialect] || {}
    queries[dialect][name] = fs.readFileSync(file).toString('utf8')
  });

  return queries
}

module.exports = fp(function mapping(fastify, opts, next) {
  const queries = getQueries('queues/sql');
  const source = process.env.SOURCE_DB;
  const target = process.env.TARGET_DB; //config.get('target.database')

  fastify.decorate('mapping', {
    source: {
      database: source,
      url: process.env.SOURCE_DB_URL, //[config.get('source.connectionString')],
      queries: queries[source] || {},
    },
    target: {
      database: target,
      url: process.env.TARGET_DB_URL, //[config.get('target.connectionString')],
      queries: queries[target] || {},
    },
    types: config.get('mapping.types'),
    exportQueue: `export-${source}`,
    importQueue: `import-${target}`,
  });

  next();
});
