
const { test } = require('tap');
const { merge } = require('lodash');
const { toSnakeCase, renameKeys, getSchema } = require('../../common/functions');
const constants = require('../../common/constants');
const models = require('../../models');

test('Convert strings to snakecase', (t) => {
  const scenarios = [
    {
      name: 'Camelcase',
      data: 'camelCase',
      expected: 'camel_case',
    },
    {
      name: 'With spaces',
      data: 'some text',
      expected: 'some_text',
    },
    {
      name: 'Mixed with underscores and hyphens',
      data: 'some-mixed_string With spaces_underscores-and-hyphens',
      expected: 'some_mixed_string_with_spaces_underscores_and_hyphens',
    },
    {
      name: 'Camel case, spaces and hyphens',
      data: 'AllThe-small THINGS',
      expected: 'all_the_small_things',
    },
    {
      name: 'Long camel case',
      data: 'IAmListeningToFMWhileLoadingDifferentURLOnMyBrowserAndAlsoEditingSomeXMLAndHTML',
      expected: 'i_am_listening_to_fm_while_loading_different_url_on_my_browser_and_also_editing_some_xml_and_html',
    },
    {
      name: 'Upper case',
      data: 'ALL UPPER _ CASE',
      expected: 'all_upper_case',
    },
    {
      name: 'Upper case with numbers',
      data: 'SOME_TABLE_BKP03-12-2019',
      expected: 'some_table_bkp03_12_2019',
    },
    {
      name: 'Symbols',
      data: '`abc`{xyz}123$',
      expected: 'abc_xyz_123',
    },
    {
      name: 'OnlySymbols',
      data: '${}`--',
      expected: '',
    },
  ];

  t.plan(scenarios.length);
  scenarios.forEach((scenario) => {
    t.same(toSnakeCase(scenario.data), scenario.expected, scenario.name);
  });
});


test('rename keys to snake case', (t) => {
  const data = {
    camelCase: 'value',
    UPPER_CASE: 123,
    'another value': 1,
  };
  const expected = {
    camel_case: 'value',
    upper_case: 123,
    another_value: 1,
  };
  t.plan(1);
  t.same(renameKeys(data), expected, 'Renaming keys  to snake case');
});

test('Force snake case', (t) => {
  const scenarios = [
    {
      model: 'schema',
      snakecase: false,
      base: models.schema.importSchema,
      override: {},
    },
    {
      model: 'schema',
      snakecase: true,
      base: models.schema.importSchema,
      override: models.schema.forceSnakeCase,
    },
    {
      model: 'table',
      snakecase: false,
      base: models.table.importSchema,
      override: {},
    },
    {
      model: 'table',
      snakecase: true,
      base: models.table.importSchema,
      override: models.table.forceSnakeCase,
    },
    {
      model: 'view',
      snakecase: false,
      base: models.view.importSchema,
      override: {},
    },
    {
      model: 'view',
      snakecase: true,
      base: models.view.importSchema,
      override: models.view.forceSnakeCase,
    },
    {
      model: 'data',
      snakecase: false,
      base: models.data.importSchema,
      override: {},
    },
    {
      model: 'data',
      snakecase: true,
      base: models.data.importSchema,
      override: models.data.forceSnakeCase,
    },
  ];

  t.plan(scenarios.length * 2);
  scenarios.forEach((scenario) => {
    const expected = scenario.base;
    let indexProperties;

    if (scenario.snakecase) {
      switch (scenario.model) {
        case 'schema':
          expected.properties.names.items.pattern = constants.SNAKE_CASE_PATTERN;
          break;
        case 'table':
          indexProperties = {
            name: { pattern: constants.SNAKE_CASE_PATTERN },
            columns: {
              items: { pattern: constants.SNAKE_CASE_PATTERN },
            },
          };
          expected.properties.schema.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.table.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.key.properties = merge(
            expected.properties.key.properties,
            indexProperties,
          );
          expected.properties.columns.items.properties = merge(
            expected.properties.columns.items.properties,
            indexProperties,
          );
          expected.properties.key.properties.columns.items.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.indexes.items.properties = merge(
            expected.properties.indexes.items.properties,
            indexProperties,
          );
          expected.properties.references.items.properties = merge(
            expected.properties.indexes.items.properties,
            indexProperties,
          );
          break;
        case 'view':
          expected.properties.schema.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.view.pattern = constants.SNAKE_CASE_PATTERN;
          break;
        case 'data':
          expected.properties.schema.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.table.pattern = constants.SNAKE_CASE_PATTERN;
          expected.properties.data = merge(
            expected.properties.data,
            scenario.override.properties.data,
          );
          break;
        default:
          break;
      }
    }
    const schema = getSchema(scenario.model, scenario.snakecase);

    t.same(schema.importSchema, merge(scenario.base, scenario.override));
    t.same(schema.importSchema, expected);
  });
});


test('Get schema', (t) => {
  const types = ['schema', 'table', 'view', 'data'];

  t.plan(types.length * 2);

  types.forEach((type) => {
    t.same(models[type], getSchema(type), `Schema matches for ${type}`);
    t.same(merge(models[type].importSchema, models[type].forceSnakeCase),
      getSchema(type, true).importSchema, `Snake case validation matches for ${type}`);
  });
});
