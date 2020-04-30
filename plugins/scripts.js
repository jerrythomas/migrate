const fs = require('fs')
const path = require('path')
const fp = require('fastify-plugin');
const config = require('config');
// const messages = require('../common/messages');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const {cacheTree} = require('../common/functions');

module.exports = fp(function mapping(fastify, opts, next) {
  let scriptPath = 'lib/scripts/';
  let fileTypes = ['jq', 'sql'];

  if (opts && opts.scripts) {
    scriptPath = opts.scripts.path || scriptPath
    fileTypes = opts.scripts.fileTypes || fileTypes
  }

  try {
    const scripts = cacheTree(scriptPath,fileTypes)
    //console.log(scripts)
    fastify.decorate('scripts', scripts);
    next();
  } catch (err) {
    next(err)
  }
});
