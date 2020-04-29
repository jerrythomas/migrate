// const tap = require("tap")
const { test } = require('tap');
const { build } = require('../helper');

test('Invalid methods', (t) => {
  const routes = [
    '/import/schema',
    '/import/table',
    '/import/view',
    '/import/data',
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
  const app = build(t);

  scenarios.forEach((scenario) => {
    app.inject({
      method: scenario.method,
      url: scenario.route,
      // body: scenario.body
    }, (err, res) => {
      t.error(err);
      t.deepEqual(JSON.parse(res.payload), scenario.expected);
    });
  });
  app.close();
});

test('No data in body', (t) => {
  const routes = [
    '/import/schema',
    '/import/table',
    '/import/view',
    '/import/data',
  ];

  t.plan(2 * routes.length);
  const app = build(t);

  routes.forEach((route) => {
    app.inject({
      method: 'post',
      url: route,
      body: '',
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
      route: '/import/schema',
      body: {},
      expected: [
        "body should have required property 'object', "
        + "body should have required property 'names'",
      ],
    },
    {
      message: 'Empty data in body',
      route: '/import/table',
      body: {},
      expected: [
        "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
        "body should have required property 'columns'",
        "body should have required property 'references'",
        "body should have required property 'indexes'",
      ],
    },
    {
      message: 'Empty data in body',
      route: '/import/view',
      body: {},
      expected: [
        "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'view'",
        "body should have required property 'code'",
        "body should have required property 'drop'",
      ],
    },
    {
      message: 'Empty data in body',
      route: '/import/data',
      body: {},
      expected: [
        "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
        "body should have required property 'data'",
      ],
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/schema',
      body: {
        object: '',
        names: '',
      },
      expected: [
        'body.object should be equal to one of the allowed values',
        'body.names should be array',
      ],
    },
    {
      message: 'Invalid data in body',
      route: '/import/schema',
      body: {
        object: 'schema',
        names: [],
      },
      expected: [
        'body.names should NOT have fewer than 1 items',
      ],
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/table',
      body: {
        object: '',
        schema: '',
        table: '',
        drop: null,
        columns: null,
        references: null,
        key: null,
        indexes: null,
      },
      expected: [
        'body.object should be equal to one of the allowed values',
        'body.columns should be array',
        'body.references should be array',
        'body.key should be object',
        'body.indexes should be array',
      ],
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/table',
      body: {
        object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [],
        references: [],
        key: {},
        indexes: [],
      },
      expected: [
        'body.columns should NOT have fewer than 1 items',
        "body.key should have required property 'columns'",
      ],
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [{}],
        references: [{}],
        key: {
          columns: [],
        },
        indexes: [{}],
      },
      expected: [
        "body.columns[0] should have required property 'name'",
        "body.columns[0] should have required property 'type'",
        "body.columns[0] should have required property 'size'",
        "body.columns[0] should have required property 'precision'",
        "body.columns[0] should have required property 'default'",
        "body.columns[0] should have required property 'position'",
        "body.columns[0] should have required property 'nullable'",
        "body.references[0] should have required property 'name'",
        "body.references[0] should have required property 'refers'",
        'body.key.columns should NOT have fewer than 1 items',
        "body.indexes[0] should have required property 'name'",
        "body.indexes[0] should have required property 'columns'",
      ],
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [{
          name: '',
          type: '',
          size: null,
          precision: null,
          default: null,
          position: null,
          nullable: '',
        }],
        references: [{
          name: '',
          refers: {},
        }],
        key: {
          columns: ['id'],
        },
        indexes: [{
          name: '',
          columns: [],
        }],
      },
      expected: [
        'body.columns[0].position should be >= 1',
        'body.columns[0].nullable should be boolean',
        "body.references[0].refers should have required property 'schema'",
        "body.references[0].refers should have required property 'table'",
        "body.references[0].refers should have required property 'columns'",
        'body.indexes[0].columns should NOT have fewer than 1 items',
      ],
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        object: 'table',
        schema: 'kingdom',
        table: 'koala_bear',
        columns: [
          {
            name: '',
            type: '',
            size: -1,
            precision: -1,
            default: -1,
            position: -1,
            nullable: false,
          },
        ],
        references: [
          {
            name: '',
            refers: {
              schema: '',
              table: '',
              columns: [],
            },
          },
        ],
        key: {
          columns: ['Key Space'],
        },
        indexes: [
          {
            name: '',
            columns: [],
          },
        ],
      },
      expected: [
        'body.columns[0].size should be >= 1',
        'body.columns[0].precision should be >= 1',
        'body.columns[0].position should be >= 1',
        'body.references[0].refers.columns should NOT have fewer than 1 items',
        'body.indexes[0].columns should NOT have fewer than 1 items',
      ],
    },
    {
      name: 'Incomplete payload',
      route: '/import/view',
      body: {
        object: 'delete',
        schema: '',
        view: '',
        code: '',
        drop: false,
      },
      expected: [
        'body.object should be equal to one of the allowed values',
        'body.code should NOT be shorter than 17 characters',
      ],
    },
    {
      name: 'Incorrect type',
      route: '/import/data',
      body: {
        object: '',
        schema: {},
        table: [],
        data: [],
      },
      expected: [
        'body.object should be equal to one of the allowed values',
        'body.schema should be string',
        'body.table should be string',
        'body.data should be object',
      ],
    },
    {
      name: 'Invalid schema, table, data',
      route: '/import/data',
      body: {
        object: 'data',
        schema: 'schema Name',
        table: 'some table name',
        data: {},
      },
      expected: [
        'body.data should NOT have fewer than 1 properties',
        // `body.schema should match pattern "${constants.SNAKE_CASE_PATTERN}"`,
        // `body.table should match pattern "${constants.SNAKE_CASE_PATTERN}"`
      ],
    },
    // {
    //   name: "Invalid column names",
    //   route: "/import/data",
    //   body: {
    //     object: "data",
    //     schema: "schema_name",
    //     table: "table_name",
    //     data: {
    //       "column Name -": "x",
    //       "CamelCol": "y"
    //     }
    //   },
    //   expected: [
    //     "\"column Name -\" is not in snakecase",
    //     "\"CamelCol\" is not in snakecase"
    //   ]
    // }
  ];

  t.plan(2 * scenarios.length);
  const app = build(t);

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

test('Valid payload', (t) => {
  const scenarios = [
    {
      message: 'Valid payload',
      route: '/import/schema',
      body: {
        object: 'schema',
        names: [
          'sc',
        ],
      },
    },
    {
      message: 'Valid payload',
      route: '/import/table',
      body: {
        object: 'table',
        schema: 'animals',
        table: 'koala_bear',
        drop: false,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            size: null,
            precision: null,
            default: null,
            position: 1,
            nullable: false,
          },
          {
            name: 'kingdom_id',
            type: 'uuid',
            size: null,
            precision: null,
            default: null,
            position: 1,
            nullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            size: 30,
            precision: null,
            default: null,
            position: 1,
            nullable: false,
          },
        ],
        references: [
          {
            name: 'kingdom_id',
            refers: {
              schema: 'animals',
              table: 'kingdom',
              columns: ['id'],
            },
          },
        ],
        key: {
          columns: ['id'],
        },
        indexes: [
          {
            name: 'animals_uk',
            columns: [
              'name',
            ],
          },
        ],
      },
    },
    {
      message: 'Valid payload',
      route: '/import/view',
      body: {
        object: 'view',
        schema: 'animals',
        view: 'all_animals_vw',
        code: 'select * from tab;',
        drop: false,
      },
    },
    {
      message: 'Valid payload',
      route: '/import/data',
      body: {
        object: 'data',
        schema: 'schema_name',
        table: 'table_name',
        data: {
          string_column: 'any string value',
          json_column: {},
          null_col: null,
          integer_col: 1,
          numeric_col: 3.14,
          array_col: [],
          bool_col: true,
        },
      },
    },
  ];
  const keys = [
    'initiatedAt',
    'completedAt',
    'duration',
  ];
  t.plan(7 * scenarios.length);
  const app = build(t);

  scenarios.forEach((scenario) => {
    // let expected = scenario.body
    // if (scenario.route != "/import/data")
    //   expected.drop = true;
    // console.log(expected)

    app.inject({
      method: 'post',
      url: scenario.route,
      body: scenario.body,
    }, (err, res) => {
      const payload = JSON.parse(res.payload);
      t.error(err);
      t.match(res.statusCode, 200);
      t.match(res.headers['content-type'], 'application/json; charset=utf-8');
      t.match(payload.message, 'task submitted');
      keys.forEach((key) => {
        t.ok(Object.keys(payload).includes(key));
      });
      // t.deepEqual(payload.data, expected)
    });
  });
  app.close();
});
