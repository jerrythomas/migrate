const { merge } = require('lodash');
const models = require('../models');
const fs = require('fs');
const path = require('path');
const {omitBy, isNil} = require('lodash');

const ValidationError = require('./errors');

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

/**
 * Walk path and read the contents into an object tree to be used as a shared cache.
 *
 * @param {string} dir - path to be recursively scanned
 * @param {string or Array} include - regex pattern to be matched or an array of file extensions
 *        used for identifying which files are included in the scan. Default includes all files.
 */
function cacheTree(dir='.', include){
  let tree = {};
  let pattern = '.+';

  if (!fs.existsSync(dir)){
    throw new ValidationError("Specified path does not exist.", { dir, include })
  }
  if (!fs.statSync(dir).isDirectory()){
    throw new ValidationError("Specified path is not a directory.", { dir, include })
  }

  const files = fs.readdirSync(dir);

  if (Array.isArray(include)) {
    pattern = '('+ include.join('|') + ')$'
  } else if (typeof(include) === 'string') {
    pattern = include
  }

  files.forEach((filename) => {
    const filepath = path.join(dir, filename);

    let key = path.basename(filename, path.extname(filename))
    if (fs.statSync(filepath).isDirectory()) {
      tree[key] = cacheTree(filepath, pattern);
    } else {
      if (path.extname(filename).match(pattern)) {
        tree[key] = fs.readFileSync(filepath).toString('utf8') //.push(filepath);
      }
    }
  });
  tree = omitBy(tree, isNil)
  return (Object.keys(tree).length === 0) ? null: tree;
}
module.exports = {
  toSnakeCase,
  renameKeys,
  getSchema,
  cacheTree
};
