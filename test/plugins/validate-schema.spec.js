const { test } = require('tap')
// const messages = require('../../common/messages')
// const { getSchema } = require('../../common/functions')
const { build } = require('../helper')

test('Snake case validations', (t) => {
  const scenarios = [
    // {
    //   message: 'Undefined schema',
    //   errors: [
    //     messages.SCHEMA_IS_NULL,
    //     messages.DATA_IS_NULL
    //   ]
    // },
    // {
    //   message: 'Undefined body',
    //   schema: {},
    //   errors: [
    //     messages.DATA_IS_NULL
    //   ]
    // },
    {
      message: 'Undefined body',
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            enum: ['correct']
          }
        }
      },
      body: {
        value: 'xyz'
      },
      errors: [
        '.value should be equal to one of the allowed values [correct]'
      ]
    } //,
    // {
    //   message: 'Undefined body',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       value: {
    //         type: 'string',
    //         enum: ['correct']
    //       }
    //     }
    //   },
    //   body: {
    //     value: 'correct'
    //   },
    //   errors: []
    // },
    // {
    //   message: 'Schema names should be in snake case',
    //   schema: getSchema('schema', true).importSchema,
    //   body: {
    //     object: 'schema',
    //     names: [
    //       'spaces not allowed',
    //       'UPPER_CASE',
    //       'CamelCase',
    //       'symbols-not-#@$%^&*()!~',
    //       {},
    //       123,
    //       true,
    //       [],
    //       '123_not_snake',
    //       'snake_case_123'
    //     ]
    //   },
    //   errors: [
    //     '.names[0] should be in snakecase',
    //     '.names[1] should be in snakecase',
    //     '.names[2] should be in snakecase',
    //     '.names[3] should be in snakecase',
    //     '.names[4] should be string',
    //     '.names[4] should be in snakecase',
    //     '.names[5] should be in snakecase',
    //     '.names[7] should be string',
    //     '.names[7] should be in snakecase',
    //     '.names[8] should be in snakecase'
    //   ]
    // },
    // {
    //   message: 'Table attributes should be in snake case',
    //   schema: getSchema('table', true).importSchema,
    //   body: {
    //     object: 'table',
    //     schema: 'sc xyz',
    //     table: 'test abc',
    //     columns: [
    //       {
    //         name: 'spaces not allowed',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         default: null,
    //         scale: null,
    //         position: 1,
    //         is_nullable: false
    //       },
    //       {
    //         name: 'UPPER_CASE',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         scale: null,
    //         default: null,
    //         position: 1,
    //         is_nullable: false
    //       },
    //       {
    //         name: 'CamelCase',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         scale: null,
    //         default: null,
    //         position: 1,
    //         is_nullable: false
    //       },
    //       {
    //         name: 'symbols-not-#@$%^&*()!~',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         scale: null,
    //         default: null,
    //         position: 1,
    //         is_nullable: false
    //       },
    //       {
    //         name: '123_not_snake',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         scale: null,
    //         default: null,
    //         position: 1,
    //         is_nullable: false
    //       },
    //       {
    //         name: 'snake_case_123',
    //         data_type: 'varchar2',
    //         size: null,
    //         precision: null,
    //         scale: null,
    //         default: null,
    //         position: 1,
    //         is_nullable: false
    //       }
    //     ],
    //     references: [{
    //       name: '',
    //       refers: {
    //         schema: ' ',
    //         table: ' ',
    //         columns: [
    //           'spaces not allowed',
    //           'UPPER_CASE',
    //           'CamelCase',
    //           'symbols-not-#@$%^&*()!~',
    //           '123_not_snake',
    //           'snake_case_123'
    //         ]
    //       }
    //     }],
    //     key: {
    //       columns: [
    //         'spaces not allowed',
    //         'UPPER_CASE',
    //         'CamelCase',
    //         'symbols-not-#@$%^&*()!~',
    //         '123_not_snake',
    //         'snake_case_123'
    //       ]
    //     },
    //     indexes: [{
    //       name: 'a b',
    //       columns: [
    //         'spaces not allowed',
    //         'UPPER_CASE',
    //         'CamelCase',
    //         'symbols-not-#@$%^&*()!~',
    //         '123_not_snake',
    //         'snake_case_123'
    //       ]
    //     }]
    //   },
    //   errors: [
    //     '.schema should be in snakecase',
    //     '.table should be in snakecase',
    //     '.columns[0].name should be in snakecase',
    //     '.columns[1].name should be in snakecase',
    //     '.columns[2].name should be in snakecase',
    //     '.columns[3].name should be in snakecase',
    //     '.columns[4].name should be in snakecase',
    //     '.references[0].name should be in snakecase',
    //     '.key.columns[0] should be in snakecase',
    //     '.key.columns[1] should be in snakecase',
    //     '.key.columns[2] should be in snakecase',
    //     '.key.columns[3] should be in snakecase',
    //     '.key.columns[4] should be in snakecase',
    //     '.indexes[0].name should be in snakecase',
    //     '.indexes[0].columns[0] should be in snakecase',
    //     '.indexes[0].columns[1] should be in snakecase',
    //     '.indexes[0].columns[2] should be in snakecase',
    //     '.indexes[0].columns[3] should be in snakecase',
    //     '.indexes[0].columns[4] should be in snakecase'
    //   ]
    // },
    // {
    //   name: 'View attributes should be in snakecase',
    //   schema: getSchema('view', true).importSchema,
    //   body: {
    //     object: 'view',
    //     schema: 'invalid schema',
    //     view: '  ',
    //     code: 'create view b as select * from a;'
    //   },
    //   errors: [
    //     '.schema should be in snakecase',
    //     '.view should be in snakecase',
    //     " should have required property 'drop'"
    //   ]
    // },
    // {
    //   name: 'Invalid column names',
    //   schema: getSchema('data', true).importSchema,
    //   body: {
    //     object: 'data',
    //     schema: 'schema name',
    //     table: 'table name',
    //     data: {
    //       'column Name -': 'x',
    //       CamelCol: 'y'
    //     }
    //   },
    //   expected: {
    //     object: 'data',
    //     schema: 'schema name',
    //     table: 'table name',
    //     data: {}
    //   },
    //   errors: [
    //     '.schema should be in snakecase',
    //     '.table should be in snakecase'
    //   ]
    // }
  ]
  t.plan(scenarios.length + 2)
  const app = build(t)

  app.ready((err) => {
    t.error(err)
    scenarios.forEach((scenario) => {
      let errors = []
      errors = app.validateSchema(scenario.schema, scenario.body)
      if (scenario.expected) {
        t.same(scenario.body, scenario.expected)
      }
      t.same(errors, scenario.errors, scenario.message)
    })
    app.close()
  })
})
