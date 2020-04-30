
const tap = require('tap');
const { build } = require('../helper');

const { test } = tap;

test('Invalid methods', (t) => {
  const routes = [
    '/export/schema',
    '/export/table',
    '/export/view',
    '/export/data',
  ];
  const methods = ['get', 'put', 'delete', 'head'];

  const scenarios = [];

  routes.forEach((route) => {
    methods.forEach((method) => {
      scenarios.push({
        message: `${method} should not be available`,
        route,
        methods: method,
        expected: {
          message: `Route GET:${route} not found`,
          error: 'Not Found',
          statusCode: 404,
        },
      });
    });
  });

  t.plan(2 * scenarios.length);
  const app = build(tap);

  scenarios.forEach((scenario) => {
    app.inject({
      method: scenario.method,
      url: scenario.route,
    }, (err, res) => {
      t.error(err);
      t.deepEqual(JSON.parse(res.payload), scenario.expected);
    });
  });
  app.close();
});

test('No data in body', (t) => {
  const routes = [
    '/export/schema',
    '/export/table',
    '/export/view',
    '/export/data',
  ];

  t.plan(2 * routes.length);
  const app = build(tap);

  routes.forEach((route) => {
    app.inject({
      method: 'post',
      url: route,
      body: null,
    }, (err, res) => {
      t.error(err);
      t.deepEqual(JSON.parse(res.payload), {
        statusCode: 400,
        error: 'Bad Request',
        message: 'body should be object',
      });
    });
  });
  app.close();
});

test('Invalid payload', (t) => {
  const scenarios = [
    {
      message: 'Empty object in body',
      route: '/export/schema',
      body: {},
      expected: [
        //"body should have required property 'object'",
        "body should have required property 'names'",
      ],
    },
    {
      message: 'Empty object in body',
      route: '/export/table',
      body: {},
      expected: [
        //"body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
      ],
    },
    {
      message: 'Empty object in body',
      route: '/export/view',
      body: {},
      expected: [
        //"body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'view'",
      ],
    },
    {
      message: 'Empty object in body',
      route: '/export/data',
      body: {},
      expected: [
        //"body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
      ],
    },
    {
      message: 'Invalid data in body',
      route: '/export/schema',
      body: {
        //object: 'table',
        names: '',
      },
      expected: [
        //'body.object should be equal to one of the allowed values',
        'body.names should be array',
      ],
    },
    {
      message: 'Invalid data in body',
      route: '/export/schema',
      body: {
        //object: 'schema',
        names: [],
      },
      expected: [
        'body.names should NOT have fewer than 1 items',
      ],
    },
    {
      message: 'Invalid types for attributes',
      route: '/export/table',
      body: {
        //object: null,
        schema: null,
        table: null,
      },
      expected: [
        "body.schema should NOT be shorter than 1 characters",
        "body.table should NOT be shorter than 1 characters"
      ],
    },
    // {
    //   message: 'Incomplete payload',
    //   route: '/export/table',
    //   body: {
    //     object: "table",
    //     schema: "sc",
    //     table: ""
    //   },
    //   expected: []
    // },
    {
      name: 'Incomplete payload',
      route: '/export/view',
      body: {
        //object: 'delete',
        schema: '',
        view: '',
        code: '',
      },
      expected: [
        //'body.object should be equal to one of the allowed values',
        'body.code should NOT be shorter than 17 characters',
      ],
    },
    {
      name: 'Incorrect type',
      route: '/export/data',
      body: {
        //object: '',
        schema: {},
        table: [],
      },
      expected: [
        //'body.object should be equal to one of the allowed values',
        'body.schema should be string',
        'body.table should be string',
      ],
    },
    // {
    //   name: "Invalid schema, table, data",
    //   route: '/export/data',
    //   body: {
    //     object: 'data',
    //     schema: 'schema Name',
    //     table: 'some table name',
    //     data: {}
    //   },
    //   expected: [
    //     '/schema value should be in snakecase',
    //     '/table value should be in snakecase'
    //   ]
    // },
    // {
    //   name: "Invalid column names",
    //   route: '/export/data',
    //   body: {
    //     object: 'data',
    //     schema: 'schema_name',
    //     table: 'table_name',
    //     data: {
    //       "column Name -": 'x',
    //       "CamelCol": 'y'
    //     }
    //   },
    //   expected: [
    //     '"column Name -" is not in snakecase',
    //     '"CamelCol" is not in snakecase'
    //   ]
    // }
  ];

  t.plan(2 * scenarios.length);
  const app = build(tap);

  scenarios.forEach((scenario) => {
    app.inject({
      method: 'post',
      url: scenario.route,
      body: scenario.body,
    }, (err, res) => {
      t.error(err);
      t.deepEqual(JSON.parse(res.payload), {
        statusCode: 400,
        error: 'Bad Request',
        message: scenario.expected.join(', '),
      });
    });
  });
  app.close();
});

// test('Valid payload', (t) => {
//   const scenarios = [
//     {
//       message: 'Valid payload',
//       route: '/export/schema',
//       body: {
//         object: 'schema',
//         action: 'create',
//         names: [
//           'sc',
//         ],
//       },
//     },
//     {
//       message: 'Valid payload',
//       route: '/export/table',
//       body: {
//         object: 'table',
//         schema: 'sc',
//         table: 'test',
//       },
//     },
//     {
//       message: 'Valid payload',
//       route: '/export/view',
//       body: {
//         object: 'view',
//         schema: 'sc',
//         view: 'test',
//       },
//     },
//     {
//       message: 'Valid payload',
//       route: '/export/data',
//       body: {
//         object: 'data',
//         schema: 'sc',
//         table: 'test',
//       },
//     },
//   ];
//   const keys = [
//     'initiatedAt',
//     'completedAt',
//     'duration',
//   ];
//   t.plan(8 * scenarios.length);
//   const app = build(tap);
//
//   scenarios.forEach((scenario) => {
//     const expected = scenario.body;
//     if (scenario.route !== '/export/data') expected.drop = true;
//
//     app.inject({
//       method: 'post',
//       url: scenario.route,
//       body: scenario.body,
//     }, (err, res) => {
//       const payload = JSON.parse(res.payload);
//       t.error(err);
//       t.match(res.statusCode, 200);
//       t.match(res.headers['content-type'], 'application/json; charset=utf-8');
//       t.match(payload.message, 'task submitted');
//       keys.forEach((key) => {
//         t.ok(Object.keys(payload).includes(key));
//       });
//       t.deepEqual(payload.data, expected);
//     });
//   });
//   app.close();
// });
