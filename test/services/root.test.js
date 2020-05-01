const { test } = require('tap');
const { build } = require('../helper');

test('default root route', async (t) => {
  t.plan(1);
  const app = build(t);
  const res = await app.inject({
    url: '/',
  });
  t.deepEqual(JSON.parse(res.payload), { root: true });
  // await app.close();
  t.end();
});

test('Test undefined env', async (t) => {
  delete (process.env.NODE_ENV);
  t.plan(1);

  const app = build(t);
  const res = await app.inject({
    url: '/',
  });
  t.deepEqual(JSON.parse(res.payload), { root: true });
  // await app.close();
  t.end();
});
