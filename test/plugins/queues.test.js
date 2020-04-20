const fs = require('fs');
const path = require('path');
const { test } = require('tap');
const rimraf = require('rimraf');
const Fastify = require('fastify');
const FastifyRedis = require('fastify-redis');
const FastifyBull = require('../../plugins/queues.js');
const { build } = require('../helper');

test('Mapping requires redis connection.', (t) => {
  t.plan(2);
  const fastify = Fastify();

  fastify.register(FastifyBull);

  fastify.ready((err) => {
    t.ok(err);
    t.match(err.message, "The dependency 'fastify-redis' of plugin 'fastify-bull' is not registered");
    fastify.close();
  });
});

test('Application queues', (t) => {
  t.plan(2);
  const app = build(t);

  app.ready((err) => {
    t.error(err);
    t.same(Object.keys(app.queues), []);
    app.close();
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
    'zzz/one.js',
    'zzz/two.js',
  ];

  files.forEach((item) => {
    fs.writeFileSync(item, '');
  });

  expected.forEach((item) => {
    const code = [
      `export const name = '${path.basename(item, path.extname(item))}';`,
      'export async function handler(server, job, done){',
      '  done()',
      '}',
    ].join('\n');

    fs.writeFileSync(item, code);
  });

  t.plan(4);
  const fastify = Fastify();
  fastify.register(FastifyRedis);
  fastify.register(FastifyBull, {
    path: 'zzz',
  });

  fastify.ready((err) => {
    t.error(err);
    t.equals(fastify.queues.length, 2);
    fastify.queues.forEach((item, i) => {
      let name = 'one';
      if (i === 1) {
        name = 'two';
      }
      t.equals(item.name, name);
    });


    fastify.close();
    rimraf.sync('zzz');
  });
});

test('Invalid path specified', (t) => {
  t.plan(2);
  const fastify = Fastify();
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
