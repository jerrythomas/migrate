const { test } = require('tap');
const { build } = require('../helper');
const Schema = require('../../queues/import-postgres/schema');
const Table = require('../../queues/import-postgres/table');
const Data = require('../../queues/import-postgres/data');
const View = require('../../queues/import-postgres/view');

const tasks = {
  schema: Schema,
  table: Table,
  data: Data,
  view: View,
};

test('Import fails for invalid data', (t) => {
  const scenarios = [
    {
      task: 'schema',
      job: {
        data: {},
      },
      result: {
        status: 'failed',
        errors: [
          " should have required property 'object'",
          " should have required property 'names'",
        ],
      },
    },
    {
      task: 'table',
      job: {
        data: {},
      },
      result: {
        status: 'failed',
        errors: [
          " should have required property 'object'",
          " should have required property 'schema'",
          " should have required property 'table'",
          " should have required property 'columns'",
          " should have required property 'references'",
          " should have required property 'indexes'",
        ],
      },
    },
    {
      task: 'data',
      job: {
        data: {},
      },
      result: {
        status: 'failed',
        errors: [
          " should have required property 'object'",
          " should have required property 'schema'",
          " should have required property 'table'",
          " should have required property 'data'",
        ],
      },
    },
    {
      task: 'view',
      job: {
        data: {},
      },
      result: {
        status: 'failed',
        errors: [
          " should have required property 'object'",
          " should have required property 'schema'",
          " should have required property 'view'",
          " should have required property 'code'",
          " should have required property 'drop'",
        ],
      },
    },
  ];

  const app = build(t);
  t.plan(1 + scenarios.length * 2);

  app.ready((err) => {
    t.error(err);
    scenarios.forEach((scenario) => {
      tasks[scenario.task].handler(app, scenario.job, (jobErr, result) => {
        t.ok(jobErr);
        t.same(result, scenario.result);
      });
    });

    app.close();
  });
});

test('Import succeeds for valid data', (t) => {
  const scenarios = [
    {
      task: 'schema',
      job: {
        data: {
          object: 'schema',
          names: ['abc'],
        },
      },
      result: {
        status: 'ok',
        data: {
          object: 'schema',
          names: ['abc'],
          drop: true,
        },
      },
    },
  ];

  const app = build(t, false);
  t.plan(1 + scenarios.length * 2);

  app.ready((err) => {
    t.error(err);
    scenarios.forEach((scenario) => {
      tasks[scenario.task].handler(app, scenario.job, (jobErr, result) => {
        t.error(jobErr);
        t.same(result, scenario.result);
      });
    });
    app.close();
  });
});
