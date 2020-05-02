const { test } = require('tap')
const Fastify = require('fastify')
const mappingPlugin = require('../../plugins/mapping')
const { build } = require('../helper')
const { mappingSchema } = require('../../models')

test('Mapping plugin works standalone', async (t) => {
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(mappingPlugin)
  await fastify.ready()
  t.ok(Object.keys(fastify.mapping).length > 0)
  t.end()
})

test('Mapping plugin content', async (t) => {
  const fastify = build(t)

  t.plan(2)
  await fastify.ready()
  const errors = fastify.validateSchema(mappingSchema, fastify.mapping)
  t.ok(fastify.mapping)
  t.same(errors, [])
  t.end()
})
