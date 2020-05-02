
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
  fastify.post(
    '/export/schema',
    {
      schema: {
        body: models.schema.exportSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/export/table',
    {
      schema: {
        body: models.table.exportSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/export/view',
    {
      schema: {
        body: models.view.exportSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/export/data',
    {
      schema: {
        body: models.data.exportSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  next()
}
