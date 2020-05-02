const fs = require('fs')
const { test } = require('tap')
const rimraf = require('rimraf')
const Fastify = require('fastify')
const fastifyRedis = require('fastify-redis')
const fastifyBull = require('../../plugins/queues.js')
const { build } = require('../helper')

test('Mapping requires redis connection.', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(fastifyBull)

  try {
    await fastify.ready()
  } catch (err) {
    t.match(err.message, "The dependency 'fastify-redis' of plugin 'fastify-bull' is not registered")
  }
  t.end()
})

test('Custom path for scripts', async (t) => {
  fs.mkdirSync('zzz/xyz/abc', { recursive: true })

  const files = [
    'zzz/one.js',
    'zzz/two.js',
    'zzz/xyz/index.js',
    'zzz/xyz/other.js',
    'zzz/xyz/abc/index.js',
    'zzz/xyz/abc/other.js'
  ]

  const expected = [
    {
      file: 'zzz/one.js',
      queue: 'one',
      task: 'first'
    },
    {
      file: 'zzz/two.js',
      queue: 'two',
      task: 'second'
    }
  ]

  files.forEach((item) => {
    fs.writeFileSync(item, '')
  })

  expected.forEach((item) => {
    const code = [
      'async function handler(server, job, done){',
      '  done()',
      '}',
      'module.exports = {',
      `  queue: "${item.queue}",`,
      `  task: "${item.task}",`,
      '  handler: handler,',
      '}'
    ].join('\n')

    fs.writeFileSync(item.file, code)
  })

  t.plan(expected.length * 2 + 1)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))
  fastify.register(fastifyRedis)
  fastify.register(fastifyBull, {
    path: 'zzz'
  })

  await fastify.ready()
  t.same(Object.keys(fastify.queues), ['one', 'two'])
  Object.entries(fastify.queues).forEach(([queueName, queue], i) => {
    t.equals(queueName, expected[i].queue)
    t.equals(Object.keys(queue.handlers)[0], expected[i].task)
  })
  rimraf.sync('zzz')
  t.end()
})

test('Invalid path specified', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(fastifyRedis)
  fastify.register(fastifyBull, {
    path: 'xxx'
  })

  await fastify.ready()
  t.same(Object.keys(fastify.queues), [])
  t.end()
})

test('File instead of folder', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(fastifyRedis)
  fastify.register(fastifyBull, {
    path: 'yyy'
  })

  fs.writeFileSync('yyy', '')

  await fastify.ready()
  t.same(Object.keys(fastify.queues), [])
  rimraf.sync('yyy')
  t.end()
})

test('Application queues', async (t) => {
  const expected = {
    'export-mysql': [
      'data',
      'schema',
      'table',
      'view'
    ],
    'import-postgres': [
      'data',
      'schema',
      'table',
      'view'
    ]
  }

  t.plan(1 + Object.keys(expected).length)
  const app = build(t)
  await app.ready()
  t.same(Object.keys(app.queues), Object.keys(expected))
  Object.entries(app.queues).forEach(([key, queue]) => {
    t.same(Object.keys(queue.handlers), expected[key])
  })

  t.end()
})

test('Mock queues', async (t) => {
  const taskNames = ['tango']
  const queueNames = ['alpha', 'beta']

  const expected = {
    alpha: [
      'tango'
    ],
    beta: [
      'tango'
    ]
  }

  const queues = {}
  const handler = function (fasify, job, done) { done() }

  queueNames.forEach((queueName) => {
    queues[queueName] = taskNames.map((task) => ({
      name: task,
      handler
    }))
  })
  t.plan(1 + Object.keys(expected).length)
  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(fastifyRedis)
  fastify.register(fastifyBull, { mock: true, queues })

  await fastify.ready()
  t.same(Object.keys(fastify.queues), Object.keys(expected))
  Object.entries(fastify.queues).forEach(([key, queue]) => {
    t.same(Object.keys(queue.handlers), expected[key])
  })
  t.end()
})
