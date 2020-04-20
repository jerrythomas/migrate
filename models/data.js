const snakecase = require('./snakecase');

const dataProperties = {
  object: {
    type: 'string',
    enum: ['data'],
  },
  schema: {
    type: 'string',
  },
  table: {
    type: 'string',
  },
  data: {
    type: 'object',
    minProperties: 1,
    uniqueProperties: true,
  },
};

const exportSchema = {
  type: 'object',
  properties: dataProperties,
  required: ['object', 'schema', 'table'],
};

const importSchema = {
  type: 'object',
  properties: dataProperties,
  required: ['object', 'schema', 'table', 'data'],
};

const forceSnakeCase = {
  properties: {
    schema: snakecase.pattern,
    table: snakecase.pattern,
    data: snakecase.properties,
  },
};

module.exports = {
  forceSnakeCase,
  dataProperties,
  exportSchema,
  importSchema,
};
