const responseProperties = {
  statusCode: { type: 'integer', enum: [200, 400] },
  message: { type: ['string', 'array'] },
  data: { type: ['object', 'array'] },
  initiatedAt: { type: 'string' },
  completedAt: { type: 'string' },
  duration: { type: 'number' },
  error: { type: 'string' }
}

const error = {
  type: 'object',
  properties: responseProperties,
  required: ['statusCode', 'message', 'initiatedAt', 'completedAt', 'duration', 'error']
}

const success = {
  type: 'object',
  properties: responseProperties,
  required: ['statusCode', 'message', 'initiatedAt', 'completedAt', 'duration']
}

const databaseProperties = {
  type: 'object',
  properties: {
    database: { type: 'string' },
    url: { type: 'string' }
  },
  required: ['database', 'url']
}
const mappingSchema = {
  type: 'object',
  properties: {
    source: databaseProperties,
    target: databaseProperties
  },
  required: ['source', 'target']
}

const response = {
  200: success,
  400: error
}

const template = {
  error,
  success,
  response,
  mappingSchema
}

module.exports = template
