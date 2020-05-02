const models = require('../models')
const { priorities } = require('../common/constants')

function handleImport (fastify, request, reply) {
  const initiatedAt = new Date()
  const result = {
    statusCode: 200,
    message: 'task submitted',
    initiatedAt: initiatedAt.toISOString()
  }

  const task = request.raw.url.split('/').pop().toLowerCase()
  fastify.queues[fastify.mapping.importQueue]
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
        body: models[route].importSchema
      },
      response: models.template.response
    }
    fastify.post(`/import/${route}`, schema, (request, reply) => handleImport(fastify, request, reply))
  })

  next()
}
