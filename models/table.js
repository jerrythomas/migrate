const snakecase = require('./snakecase');

const columnProperties = {
  name: { type: 'string' },
  data_type: { type: 'string' },
  precision: { type: 'integer', nullable: true, minimum: 1 },
  scale: { type: 'integer', nullable: true, minimum: 1 },
  default: { type: 'string', nullable: true },
  position: { type: 'integer', minimum: 1 },
  is_nullable: { type: 'boolean' },
  key: { type: 'string' },
  comment: { type: 'string' },
  extra: { type: 'string' },
  generation_expression: { type: 'string' },
};

const foreignKeyProperties = {
  name: { type: 'string' },
  refers: {
    type: 'object',
    properties: {
      schema: { type: 'string' },
      table: { type: 'string' },
      columns: { type: 'array', minItems: 1, items: { type: 'string' } },
    },
    required: ['schema', 'table', 'columns'],
  },
};

const indexProperties = {
  name: { type: 'string' },
  uniqueness: { type: 'boolean', default: false },
  columns: {
    type: 'array',
    minItems: 1,
    items: { type: 'string' },
  },
};

const tableProperties = {
  // object: { type: 'string', enum: ['table'] },
  schema: { type: 'string', minLength: 1 },
  table: { type: 'string', minLength: 1 },
  drop: { type: 'boolean', default: false },
  columns: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      properties: columnProperties,
      required: ['name', 'data_type', 'precision', 'scale', 'default', 'is_nullable', 'position'],
    },
  },
  references: {
    type: 'array',
    items: {
      type: 'object',
      properties: foreignKeyProperties,
      required: ['name', 'refers'],
    },
  },
  key: {
    type: 'object',
    properties: indexProperties,
    required: ['columns'],
  },
  indexes: {
    type: 'array',
    items: {
      type: 'object',
      properties: indexProperties,
      required: ['name', 'columns', 'uniqueness'],
    },
  },
};

const exportSchema = {
  type: 'object',
  properties: tableProperties,
  required: ['schema', 'table'],
};

const importSchema = {
  type: 'object',
  properties: tableProperties,
  required: ['schema', 'table', 'columns', 'references', 'indexes'],
};

const snakeCaseIndexProperties = {
  name: snakecase.pattern,
  columns: {
    items: snakecase.pattern,
  },
};
const forceSnakeCase = {
  properties: {
    schema: snakecase.pattern,
    table: snakecase.pattern,
    columns: {
      items: {
        properties: snakeCaseIndexProperties,
      },
    },
    key: {
      properties: snakeCaseIndexProperties,
    },
    indexes: {
      items: {
        properties: snakeCaseIndexProperties,
      },
    },
    references: {
      items: {
        properties: snakeCaseIndexProperties,
      },
    },

  },
};
const schema = {
  forceSnakeCase,
  tableProperties,
  columnProperties,
  indexProperties,
  foreignKeyProperties,
  importSchema,
  exportSchema,
};

module.exports = schema;
