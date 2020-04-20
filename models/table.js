const snakecase = require('./snakecase');

const columnProperties = {
  name: { type: 'string' },
  type: { type: 'string' },
  size: { type: 'integer', nullable: true, minimum: 1 },
  precision: { type: 'integer', nullable: true, minimum: 1 },
  default: { type: 'string', nullable: true },
  position: { type: 'integer', minimum: 1 },
  nullable: { type: 'boolean' },
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
  columns: {
    type: 'array',
    minItems: 1,
    items: { type: 'string' },
  },
};

const tableProperties = {
  object: { type: 'string', enum: ['table'] },
  schema: { type: 'string' },
  table: { type: 'string' },
  drop: { type: 'boolean', default: false },
  columns: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      properties: columnProperties,
      required: ['name', 'type', 'size', 'precision', 'default', 'nullable', 'position'],
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
      required: ['name', 'columns'],
    },
  },
};

const exportSchema = {
  type: 'object',
  properties: tableProperties,
  required: ['object', 'schema', 'table'],
};

const importSchema = {
  type: 'object',
  properties: tableProperties,
  required: ['object', 'schema', 'table', 'columns', 'references', 'indexes'],
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
