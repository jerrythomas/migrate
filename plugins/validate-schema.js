const FastifyPlugin = require('fastify-plugin')
const messages = require('../common/messages')
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

function validateSchema (fastify, opts, next) {
  fastify.decorate('validateSchema', (schema, data) => {
    const errors = []

    if (!schema) {
      errors.push(messages.SCHEMA_IS_NULL)
    }
    if (!data) {
      errors.push(messages.DATA_IS_NULL)
    }

    if (errors.length > 0) {
      return errors
    }

    const validator = fastify.schemaCompiler(schema)
    const valid = validator(data)

    if (!valid && validator.errors) {
      validator.errors.forEach((e) => {
        let extra = ''
        if (e.keyword === 'enum') {
          extra = ` [${e.params.allowedValues}]`
        }
        errors.push(`${e.dataPath || ''} ${e.message}${extra}`)
      })
    }

    return errors
  })

  next()
}

module.exports = FastifyPlugin(validateSchema, {
  name: 'validate-schema'
})
