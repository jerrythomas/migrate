const { test } = require('tap');
const { build } = require('../helper');
const Schema = require('../../queues/export-mysql/schema');
const Table = require('../../queues/export-mysql/table');
const Data = require('../../queues/export-mysql/data');
const View = require('../../queues/export-mysql/view');

const tasks= {
  schema: Schema,
  table: Table,
  data: Data,
  view: View,
}


test('Export fails for invalid data', (t) => {
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
          " should have required property 'table'"
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
          " should have required property 'table'"
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

test('Export succeeds for valid data', (t) => {
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

  const app = build(t);
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
