const { merge } = require('lodash');
const models = require('../models');

function toSnakeCase(input) {
  let result = input;
  if (result === result.toUpperCase()) {
    result = result.toLowerCase();
  }

  result = result.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);

  if (result) {
    return result.map((x) => x.toLowerCase())
      .join('_');
  }
  return '';
}

function renameKeys(obj) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [toSnakeCase(key)]: obj[key] },
    }),
    {},
  );
}

function getSchema(name, snakecase = false) {
  const schema = models[name];

  if (snakecase) {
    schema.importSchema = merge(schema.importSchema, schema.forceSnakeCase);
  }

  return schema;
}

module.exports = {
  toSnakeCase,
  renameKeys,
  getSchema,
};
