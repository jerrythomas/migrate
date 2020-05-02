const models = require('../models')
const { priorities } = require('../common/constants')

function handleExport (fastify, request, reply) {
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
  fastify.post(
    '/import/schema',
    {
      schema: {
        body: models.schema.importSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/import/table',
    {
      schema: {
        body: models.table.importSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/import/view',
    {
      schema: {
        body: models.view.importSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  fastify.post(
    '/import/data',
    {
      schema: {
        body: models.data.importSchema
      },
      response: models.template.response
    },
    (request, reply) => {
      handleExport(fastify, request, reply)
    }
  )

  next()
}
