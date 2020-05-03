
const models = require('../models')
const { priorities } = require('../common/constants')
const { wrapPerformance } = require('../common/functions')
const { pick } = require('lodash')
// function handleExport (fastify, request, reply) {
//   const result = wrapPerformance('task submitted', () => {
//     const task = request.raw.url.split('/').pop().toLowerCase()
//     fastify.queues[fastify.mapping.exportQueue]
//       .add(task, request.body, priorities[task])
//     return request.body
//   })
//
//   reply.code(result.statusCode).send(result)
// }

module.exports = (fastify, opts, next) => {
  const routes = ['schema', 'table', 'view', 'data']
  const modes = ['export', 'import']

  modes.map(mode => {
    routes.map(route => {
      const schema = {
        schema: {
          body: models[route][`${mode}Schema`]
        },
        response: models.template.response
      }
      fastify.post(`/${mode}/${route}`, schema, async (request, reply) => {
        // handleExport(fastify, request, reply)
        const result = await wrapPerformance('task submitted', async () => {
          const task = request.raw.url.split('/').pop().toLowerCase()
          const result = await fastify.queues[fastify.mapping[`${mode}Queue`]]
            .add(task, request.body, { priority: priorities[task] })
          return pick(result, ['queue.name', 'name', 'opts.priority'])
        })

        reply.code(result.statusCode).send(result)
      })
    })
  })

  next()
}
