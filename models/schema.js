const snakecase = require('./snakecase');

const schemaProperties = {
  // object: { type: 'string', enum: ['schema'] },
  names: {
    type: 'array',
    minItems: 1,
    items: { type: 'string' },
  },
  drop: { type: 'boolean', default: true },
};

const exportSchema = {
  type: 'object',
  properties: schemaProperties,
  required: ['names'],
};

const importSchema = {
  type: 'object',
  properties: schemaProperties,
  required: ['names'],
};

const forceSnakeCase = {
  properties: {
    names: {
      items: snakecase.pattern,
    },
  },
};
const schema = {
  forceSnakeCase,
  schemaProperties,
  exportSchema,
  importSchema,
};

module.exports = schema;
