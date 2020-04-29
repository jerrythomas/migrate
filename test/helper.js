
// This file contains code that we reuse
// between our tests.

const Fastify = require('fastify');
const FastifyPlugin = require('fastify-plugin');
const App = require('../app');

// Fill in this config with all the configurations
// needed for testing the application
function config(mock=false) {

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

module.exports = {
  config,
  build,
};
