const snakecase = require('./snakecase');

const viewProperties = {
  object: { type: 'string', enum: ['view'] },
  schema: { type: 'string' },
  view: { type: 'string' },
  code: { type: 'string', minLength: 17 },
  drop: { type: 'boolean' },
};

const exportSchema = {
  type: 'object',
  properties: viewProperties,
  required: ['object', 'schema', 'view'],
};

const importSchema = {
  type: 'object',
  properties: viewProperties,
  required: ['object', 'schema', 'view', 'code', 'drop'],
};

const forceSnakeCase = {
  properties: {
    schema: snakecase.pattern,
    view: snakecase.pattern,
  },
};
const schema = {
  forceSnakeCase,
  viewProperties,
  exportSchema,
  importSchema,
};

module.exports = schema;
