module.exports = {
  SNAKE_CASE_PATTERN: '^[a-z]+(([a-z]|[0-9]|_)*([a-z]|[0-9])+)*$',
  SNAKE_CASE_CONVERT: '[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+',
  priorities: {
    schema: 1,
    table: 2,
    data: 3,
    view: 4
  }
}
