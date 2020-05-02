class ValidationError extends Error {
  constructor (message, data, errors) {
    super(message)
    this.name = 'ValidationError'
    this.data = data
    this.errors = errors || []
  }
}

module.exports = ValidationError
