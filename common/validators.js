const constants = require('./constants');

// function validateNotEmpty(schema, value) {
//   if (typeof (value) === 'string') {
//     validateNotEmpty.errors = [
//       {
//         keyword: 'notempty',
//         params: { keyword: 'notempty' },
//         message: 'should not be empty',
//       },
//     ];
//     return value.toString().trim().length > 0;
//   }
//   return true;
// }

// Looks like the validator is not called when the type is not string
// probably because types are converted
function validateSnakeCase(schema, value) {
  validateSnakeCase.errors = [
    {
      keyword: 'snakecase',
      params: { keyword: 'snakecase' },
      message: 'should be in snakecase',
    },
  ];
  const re = new RegExp(constants.SNAKE_CASE_PATTERN);
  return re.test(value);
}

module.exports = {
  snakecase: validateSnakeCase,
  // notempty: validateNotEmpty,
};
