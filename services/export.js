
const models = require('../models')
const { priorities } = require('../common/constants')

function handleExport (fastify, request, reply) {
  const initiatedAt = new Date()
  const result = {
    statusCode: 200,
    message: 'task submitted',
    initiatedAt: initiatedAt.toISOString(),
    data: request.body
  }

  // Submit processing task to queue
  const task = request.raw.url.split('/').pop().toLowerCase()
  fastify.queues[fastify.mapping.exportQueue]
    .add(task, request.body, priorities[task])

  const completedAt = new Date()
  result.completedAt = completedAt.toISOString()
  result.duration = (completedAt - initiatedAt) / 1000
  reply.code(result.statusCode)
    .send(result)
}

module.exports = (fastify, opts, next) => {
  const routes = ['schema', 'table', 'view', 'data']

  routes.map(route => {
    const schema = {
      schema: {
        body: models[route].exportSchema
      },
      response: models.template.response
    }
    fastify.post(`/export/${route}`, schema, (request, reply) => handleExport(fastify, request, reply))
  })

  next()
}
