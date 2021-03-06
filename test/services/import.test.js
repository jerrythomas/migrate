// const tap = require("tap")
const { test } = require('tap')
const { build } = require('../helper')

test('Invalid methods', async (t) => {
  const routes = [
    '/import/schema',
    '/import/table',
    '/import/view',
    '/import/data'
  ]
  const methods = ['get', 'put', 'delete', 'head']

  const scenarios = []

  routes.forEach((route) => {
    methods.forEach((method) => {
      scenarios.push({
        message: `${method} should not be available`,
        route,
        methods: method,
        expected: {
          message: `Route GET:${route} not found`,
          error: 'Not Found',
          statusCode: 404
        }
      })
    })
  })

  t.plan(scenarios.length)
  const app = build(t)
  await app.ready()

  const cases = await scenarios.map(async (scenario) => {
    const res = await app.inject({
      method: scenario.method,
      url: scenario.route
      // body: scenario.body
    })
    t.deepEqual(JSON.parse(res.payload), scenario.expected)
  })

  await Promise.all(cases)
  t.end()
})

test('No data in body', async (t) => {
  const routes = [
    '/import/schema',
    '/import/table',
    '/import/view',
    '/import/data'
  ]

  t.plan(routes.length)
  const app = build(t)
  await app.ready()

  const cases = await routes.map(async (route) => {
    const res = await app.inject({
      method: 'post',
      url: route,
      body: ''
    })
    t.deepEqual(JSON.parse(res.payload), {
      statusCode: 400,
      error: 'Bad Request',
      message: 'body should be object'
    })
  })
  await Promise.all(cases)
  t.end()
})

test('Invalid payload', async (t) => {
  const scenarios = [
    {
      message: 'Empty object in body',
      route: '/import/schema',
      body: {},
      expected: [
        // "body should have required property 'object', "
        "body should have required property 'names'"
      ]
    },
    {
      message: 'Empty data in body',
      route: '/import/table',
      body: {},
      expected: [
        // "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
        "body should have required property 'columns'",
        "body should have required property 'references'",
        "body should have required property 'indexes'"
      ]
    },
    {
      message: 'Empty data in body',
      route: '/import/view',
      body: {},
      expected: [
        // "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'view'",
        "body should have required property 'code'",
        "body should have required property 'drop'"
      ]
    },
    {
      message: 'Empty data in body',
      route: '/import/data',
      body: {},
      expected: [
        // "body should have required property 'object'",
        "body should have required property 'schema'",
        "body should have required property 'table'",
        "body should have required property 'data'"
      ]
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/schema',
      body: {
        // object: '',
        names: ''
      },
      expected: [
        // 'body.object should be equal to one of the allowed values',
        'body.names should be array'
      ]
    },
    {
      message: 'Invalid data in body',
      route: '/import/schema',
      body: {
        // object: 'schema',
        names: []
      },
      expected: [
        'body.names should NOT have fewer than 1 items'
      ]
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/table',
      body: {
        // object: '',
        schema: '',
        table: '',
        drop: null,
        columns: null,
        references: null,
        key: null,
        indexes: null
      },
      expected: [
        // 'body.object should be equal to one of the allowed values',
        'body.schema should NOT be shorter than 1 characters',
        'body.table should NOT be shorter than 1 characters',
        'body.columns should be array',
        'body.references should be array',
        'body.key should be object',
        'body.indexes should be array'
      ]
    },
    {
      message: 'Invalid types for attributes',
      route: '/import/table',
      body: {
        // object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [],
        references: [],
        key: {},
        indexes: []
      },
      expected: [
        'body.columns should NOT have fewer than 1 items',
        "body.key should have required property 'columns'"
      ]
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        // object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [{}],
        references: [{}],
        key: {
          columns: []
        },
        indexes: [{}]
      },
      expected: [
        "body.columns[0] should have required property 'name'",
        "body.columns[0] should have required property 'data_type'",
        "body.columns[0] should have required property 'precision'",
        "body.columns[0] should have required property 'scale'",
        "body.columns[0] should have required property 'default'",
        "body.columns[0] should have required property 'position'",
        "body.columns[0] should have required property 'is_nullable'",
        "body.references[0] should have required property 'name'",
        "body.references[0] should have required property 'refers'",
        'body.key.columns should NOT have fewer than 1 items',
        "body.indexes[0] should have required property 'name'",
        "body.indexes[0] should have required property 'columns'"
      ]
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        // object: 'table',
        schema: 'sc',
        table: 'test',
        columns: [{
          name: '',
          data_type: '',
          size: null,
          precision: null,
          scale: null,
          default: null,
          position: null,
          is_nullable: ''
        }],
        references: [{
          name: '',
          refers: {}
        }],
        key: {
          columns: ['id']
        },
        indexes: [{
          name: '',
          columns: []
        }]
      },
      expected: [
        'body.columns[0].position should be >= 1',
        'body.columns[0].is_nullable should be boolean',
        "body.references[0].refers should have required property 'schema'",
        "body.references[0].refers should have required property 'table'",
        "body.references[0].refers should have required property 'columns'",
        'body.indexes[0].columns should NOT have fewer than 1 items'
      ]
    },
    {
      message: 'Incomplete payload',
      route: '/import/table',
      body: {
        // object: 'table',
        schema: 'kingdom',
        table: 'koala_bear',
        columns: [
          {
            name: '',
            data_type: '',
            precision: -1,
            scale: -1,
            default: -1,
            position: -1,
            is_nullable: false
          }
        ],
        references: [
          {
            name: '',
            refers: {
              schema: '',
              table: '',
              columns: []
            }
          }
        ],
        key: {
          columns: ['Key Space']
        },
        indexes: [
          {
            name: '',
            columns: []
          }
        ]
      },
      expected: [
        'body.columns[0].precision should be >= 1',
        'body.columns[0].scale should be >= 1',
        'body.columns[0].position should be >= 1',
        'body.references[0].refers.columns should NOT have fewer than 1 items',
        'body.indexes[0].columns should NOT have fewer than 1 items'
      ]
    },
    {
      name: 'Incomplete payload',
      route: '/import/view',
      body: {
        // object: 'delete',
        schema: '',
        view: '',
        code: '',
        drop: false
      },
      expected: [
        // 'body.object should be equal to one of the allowed values',
        'body.code should NOT be shorter than 17 characters'
      ]
    },
    {
      name: 'Incorrect type',
      route: '/import/data',
      body: {
        // object: '',
        schema: {},
        table: [],
        data: []
      },
      expected: [
        // 'body.object should be equal to one of the allowed values',
        'body.schema should be string',
        'body.table should be string',
        'body.data should be object'
      ]
    },
    {
      name: 'Invalid schema, table, data',
      route: '/import/data',
      body: {
        // object: 'data',
        schema: 'schema Name',
        table: 'some table name',
        data: {}
      },
      expected: [
        'body.data should NOT have fewer than 1 properties'
      ]
    }
  ]

  t.plan(scenarios.length)
  const app = build(t)
  await app.ready()

  const cases = await scenarios.map(async (scenario) => {
    const res = await app.inject({
      method: 'post',
      url: scenario.route,
      body: scenario.body
    })
    t.deepEqual(JSON.parse(res.payload), {
      statusCode: 400,
      error: 'Bad Request',
      message: scenario.expected.join(', ')
    })
  })
  await Promise.all(cases)
  t.end()
})

test('Valid payload', async (t) => {
  const scenarios = [
    {
      message: 'Valid payload',
      route: '/import/schema',
      body: {
        // object: 'schema',
        names: [
          'sc'
        ]
      },
      output: {
        queue: { name: 'import-postgres' },
        name: 'schema',
        opts: { priority: 1 }
      }
    },
    {
      message: 'Valid payload',
      route: '/import/table',
      body: {
        // object: 'table',
        schema: 'animals',
        table: 'koala_bear',
        drop: false,
        columns: [
          {
            name: 'id',
            data_type: 'uuid',
            precision: null,
            scale: null,
            default: null,
            position: 1,
            is_nullable: false
          },
          {
            name: 'kingdom_id',
            data_type: 'uuid',
            precision: null,
            scale: null,
            default: null,
            position: 1,
            is_nullable: false
          },
          {
            name: 'name',
            data_type: 'varchar',
            precision: 30,
            scale: 2,
            default: null,
            position: 1,
            is_nullable: false
          }
        ],
        references: [
          {
            name: 'kingdom_id',
            refers: {
              schema: 'animals',
              table: 'kingdom',
              columns: ['id']
            }
          }
        ],
        key: {
          columns: ['id']
        },
        indexes: [
          {
            name: 'animals_uk',
            columns: [
              'name'
            ]
          }
        ]
      },
      output: {
        queue: { name: 'import-postgres' },
        name: 'table',
        opts: { priority: 2 }
      }
    },
    {
      message: 'Valid payload',
      route: '/import/view',
      body: {
        // object: 'view',
        schema: 'animals',
        view: 'all_animals_vw',
        code: 'select * from tab;',
        drop: false
      },
      output: {
        queue: { name: 'import-postgres' },
        name: 'view',
        opts: { priority: 4 }
      }
    },
    {
      message: 'Valid payload',
      route: '/import/data',
      body: {
        // object: 'data',
        schema: 'schema_name',
        table: 'table_name',
        data: {
          string_column: 'any string value',
          json_column: {},
          null_col: null,
          integer_col: 1,
          numeric_col: 3.14,
          array_col: [],
          bool_col: true
        }
      },
      output: {
        queue: { name: 'import-postgres' },
        name: 'data',
        opts: { priority: 3 }
      }
    }
  ]
  const keys = [
    'initiatedAt',
    'completedAt',
    'duration'
  ]
  t.plan(7 * scenarios.length)
  const app = build(t, true)
  await app.ready()
  const cases = await scenarios.map(async (scenario) => {
    // let expected = scenario.body
    // if (scenario.route != "/import/data")
    //   expected.drop = true;
    // console.log(expected)

    const res = await app.inject({
      method: 'post',
      url: scenario.route,
      body: scenario.body
    })
    const payload = JSON.parse(res.payload)
    t.match(res.statusCode, 200)
    t.match(res.headers['content-type'], 'application/json; charset=utf-8')
    t.match(payload.message, 'task submitted')
    keys.forEach((key) => {
      t.ok(Object.keys(payload).includes(key))
    })
    t.deepEqual(payload.data, scenario.output)
  })

  await Promise.all(cases)
  t.end()
})
