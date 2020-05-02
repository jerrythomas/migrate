
const models = require('../models')

function handleExport (fastify, request, reply) {
  const initiatedAt = new Date()
  const result = {
    statusCode: 200,
    message: 'task submitted',
    initiatedAt: initiatedAt.toISOString()
  }

  // Submit processing task to queue
  // try {
  //   let mapping = fastify.mapping()
  //   fastify.queues[`import-${mapping.source.database}`]
  //          .add(request.body, fastify.priorities[request.body.object])
  //
  // } catch (err) {
  //   result.message = 'Could not submit task'
  //   result.error = err.message,
  //   result.data = request.body
  // }

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
