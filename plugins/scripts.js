const fp = require('fastify-plugin');
// const messages = require('../common/messages');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const { cacheTree } = require('../common/functions');

module.exports = fp(function scripts(fastify, opts, next) {
  let scriptPath = 'lib/scripts/';
  let fileTypes = ['jq', 'sql'];

  if (opts && opts.scripts) {
    scriptPath = opts.scripts.path || scriptPath;
    fileTypes = opts.scripts.fileTypes || fileTypes;
  }

  try {
    const cache = cacheTree(scriptPath, fileTypes);
    // console.log(scripts)
    fastify.decorate('scripts', cache);
    next();
  } catch (err) {
    next(err);
  }
});
