const fs = require('fs');
const { test } = require('tap');
const rimraf = require('rimraf');
const Fastify = require('fastify');
const FastifyRedis = require('fastify-redis');
const FastifyBull = require('../../plugins/queues.js');
const { build } = require('../helper');

test('Mapping requires redis connection.', (t) => {
  t.plan(2);
  const fastify = Fastify();
  t.tearDown(fastify.close.bind(fastify));
  fastify.register(FastifyBull);

  fastify.ready((err) => {
    t.ok(err);
    t.match(err.message, "The dependency 'fastify-redis' of plugin 'fastify-bull' is not registered");
    fastify.close();
  });
});

test('Custom path for scripts', (t) => {
  fs.mkdirSync('zzz/xyz/abc', { recursive: true });

  const files = [
    'zzz/one.js',
    'zzz/two.js',
    'zzz/xyz/index.js',
    'zzz/xyz/other.js',
    'zzz/xyz/abc/index.js',
    'zzz/xyz/abc/other.js',
  ];

  const expected = [
    {
      file: 'zzz/one.js',
      queue: 'one',
      task: 'first',
    },
    {
      file: 'zzz/two.js',
      queue: 'two',
      task: 'second',
    },
  ];

  files.forEach((item) => {
    fs.writeFileSync(item, '');
  });

  expected.forEach((item) => {
    const code = [
      'async function handler(server, job, done){',
      '  done()',
      '}',
      'module.exports = {',
      `  queue: "${item.queue}",`,
      `  task: "${item.task}",`,
      '  handler: handler,',
      '}',
    ].join('\n');

    fs.writeFileSync(item.file, code);
  });

  t.plan(expected.length * 2 + 2);
  const fastify = Fastify();
  t.tearDown(fastify.close.bind(fastify));
  fastify.register(FastifyRedis);
  fastify.register(FastifyBull, {
    path: 'zzz',
  });

  fastify.ready((err) => {
    t.error(err);
    t.same(Object.keys(fastify.queues), ['one', 'two']);
    Object.entries(fastify.queues).forEach(([queueName, queue], i) => {
      t.equals(queueName, expected[i].queue);
      t.equals(Object.keys(queue.handlers)[0], expected[i].task);
    });

    fastify.close();
    rimraf.sync('zzz');
  });
});

test('Invalid path specified', (t) => {
  t.plan(2);
  const fastify = Fastify();
  t.tearDown(fastify.close.bind(fastify));
  fastify.register(FastifyRedis);
  fastify.register(FastifyBull, {
    path: 'xxx',
  });

  fastify.ready((err) => {
    t.error(err);
    t.same(Object.keys(fastify.queues), []);
    fastify.close();
  });
});

test('File instead of folder', (t) => {
  t.plan(2);
  const fastify = Fastify();
  t.tearDown(fastify.close.bind(fastify));
  fastify.register(FastifyRedis);
  fastify.register(FastifyBull, {
    path: 'yyy',
  });

  fs.writeFileSync('yyy', '');

  fastify.ready((err) => {
    t.error(err);
    t.same(Object.keys(fastify.queues), []);
    fastify.close();
    rimraf.sync('yyy');
  });
});

test('Application queues', (t) => {
  const app = build(t);
  const expected = {
    'export-mysql': [
      'data',
      'schema',
      'table',
      'view',
    ],
    'import-postgres': [
      'data',
      'schema',
      'table',
      'view',
    ],
  };

  t.plan(2 + Object.keys(expected).length);
  app.ready((err) => {
    t.error(err);
    t.same(Object.keys(app.queues), Object.keys(expected));
    Object.entries(app.queues).forEach(([key, queue]) => {
      t.same(Object.keys(queue.handlers), expected[key]);
    });

    app.close();
  });
});

// If you prefer async/await, use the following
//
// test('support works standalone', async (t) => {
//   const fastify = Fastify()
//   fastify.register(Support)
//
//   await fastify.ready()
//   t.equal(fastify.someSupport(), 'hugs')
// })
