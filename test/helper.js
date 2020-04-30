
// This file contains code that we reuse
// between our tests.
const fs = require('fs');
const path = require('path');

const Fastify = require('fastify');
const FastifyPlugin = require('fastify-plugin');
const App = require('../app');

// Fill in this config with all the configurations
// needed for testing the application
function config(mock=false) {
  // console.log(mock)
  if (!mock){
    return {}
  }

  const taskNames = ['schema', 'table', 'view', 'data', 'references'];
  const dbNames = ['mysql','postgres'];
  const actions = ['export', 'import'];
  let queues = {}

  actions.map((action) => {
    dbNames.map(name => {
      let queueName = `${action}-${name}`
      queues[queueName] = []
      taskNames.map(task => {
        queues[queueName].push({
          name: task,
          handler: function (fasify, job, done) {done()}
        })
      })
    })
  })
  // console.log(mock, queues);
  return {mock, queues};
}

// automatically build and tear down our instance
function build(t, mock=false) {
  const app = Fastify();

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  app.register(FastifyPlugin(App), config(mock));

  // tear down our app after we are done
  t.tearDown(app.close.bind(app));

  return app;
}

function buildTree(dest, tree, fileExt) {
  let ext = ['js','ts','txt']
  if (Array.isArray(fileExt)){
    ext = fileExt
  } else if (typeof(fileExt) === 'string') {
    ext = [fileExt]
  }

  Object.entries(tree).map(([key, value]) => {
    if (typeof(value) == 'string'){
      let idx = Math.floor(Math.random()*ext.length)
      fs.mkdirSync(dest, {recursive:true})
      fs.writeFileSync(path.join(dest, key + '.' + ext[idx]), value);
    } else {
      buildTree(path.join(dest, key), value, ext)
    }
  })
}

module.exports = {
  config,
  build,
  buildTree
};
