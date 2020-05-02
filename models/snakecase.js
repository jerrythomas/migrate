const pattern = {
  snakecase: true
}

const properties = {
  patternProperties: {
    '^[a-z]+(([a-z]|[0-9]|_)*([a-z]|[0-9])+)*$': {
      type: ['number', 'integer', 'string', 'boolean', 'array', 'object', 'null']
    }
  },
  additionalProperties: false
}

module.exports = {
  pattern,
  properties
}
