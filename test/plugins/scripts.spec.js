const { test } = require('tap')
const Fastify = require('fastify')
const scriptsPlugin = require('../../plugins/scripts')
const ValidationError = require('../../common/errors')

test('Scripts plugin works standalone', async (t) => {
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(scriptsPlugin)

  t.plan(2)
  await fastify.ready()
  t.same(Object.keys(fastify.scripts), ['jq', 'sql'])
  t.same(Object.keys(fastify.scripts.sql.mysql), ['columns', 'data', 'indexes', 'key', 'references', 'tables'])
  t.end()
})

test('Scripts plugin works standalone', async (t) => {
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(scriptsPlugin, { scripts: {} })

  t.plan(2)
  await fastify.ready()
  t.same(Object.keys(fastify.scripts), ['jq', 'sql'])
  t.same(Object.keys(fastify.scripts.sql.mysql), ['columns', 'data', 'indexes', 'key', 'references', 'tables'])
  t.end()
})

test('Scripts plugin with invalid config', async (t) => {
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(scriptsPlugin, { scripts: { path: 'tmp', fileTypes: [] } })

  t.plan(1)
  try {
    await fastify.ready()
  } catch (err) {
    t.ok(err instanceof ValidationError, 'Should throw ValidationError with invalid config.')
  }
  t.end()
})
