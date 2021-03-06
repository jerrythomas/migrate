
// todo: implement login and auth
module.exports = (fastify, opts, next) => {
  fastify.get('/', (request, reply) => {
    reply.send({ root: true })
  })

  next()
}

// If you prefer async/await, use the following
//
// module.exports = async function (fastify, opts) {
//   fastify.get('/', async function (request, reply) {
//     return { root: true }
//   })
// }
