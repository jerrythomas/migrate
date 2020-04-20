const { test } = require('tap');

test('Validate that cluster runs', (t) => {
  t.plan(1);

  try {
    require('../cluster.js');
  } catch (err) {
    t.error(err);
  }
});
