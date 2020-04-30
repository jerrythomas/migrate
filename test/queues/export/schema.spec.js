const { test } = require('tap');
const { mock } = require('../mock');
const { handler } = require('../../queues/export-mysql/schema');

test('Export schemas from mysql', async (t) => {

  //console.log(fastify)
  const scenario= {
    job: {
      data: {
        names: [
          'exp_data',
          'no_such_schema'
        ]
      }
    },
    expected: {
      status: 'ok',
      warnings: [
        '"no_such_schema" does not contain any tables to export',
            "\"exp_dep\" has referenced tables which will be exported.",
      ],
     jobs:  [
       {
        "name": "schema",
        "data":  {
          object: "schema",
          "names":  [
            "exp_data",
            "exp_dep",
            "no_such_schema",
          ],
        },
        "opts":  {
          "priority": 1,
        },
      },
       {
        "name": "table",
        "data":  {
          "table": "no_fk_data",
          "schema": "exp_data",
          object: "table",
        },
        "opts":  {
          "priority": 2,
        },
      },
       {
        "name": "table",
        "data":  {
          "table": "self_fk_data",
          "schema": "exp_data",
          object: "table",
        },
        "opts":  {
          "priority": 2,
        },
      },
       {
        "name": "table",
        "data":  {
          "table": "dep_lookup",
          "schema": "exp_dep",
          object: "table",
        },
        "opts":  {
          "priority": 2,
        },
      },
       {
        "name": "table",
        "data":  {
          "table": "has_fk_data",
          "schema": "exp_data",
          object: "table",
        },
        "opts":  {
          "priority": 3,
        },
      },
       {
        "name": "table",
        "data":  {
          "table": "l2_fk_data",
          "schema": "exp_data",
          object: "table",
        },
        "opts":  {
          "priority": 4,
        },
      },
    ]
    }
  }

  t.plan(2);
  const mockApp = await build(t, true); //'mysql', 'postgres');
  res = await handler(mockApp, scenario.job); // , async (err, res) =>{
  //t.error(err);
     //await mockApp.mysql.source.end();
  t.same(res, scenario.expected);
  t.end();
  //});

})
