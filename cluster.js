const os = require('os')
const cluster = require('cluster')

const numCPUs = parseInt(process.env.CLUSTER_SIZE || os.cpus().length, 10)

// Read the .env file.
// require('dotenv').config()

// Require the framework
const Fastify = require('fastify')

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
  pluginTimeout: 10000
})
// Register your application as a normal plugin.
app.register(require('./app.js'))

process.on('uncaughtException', (error) => {
  app.log.error(error)
})
process.on('unhandledRejection', (error) => {
  app.log.error(error)
})

function masterProcess () {
  app.log.info(`Master ${process.pid} is running`)

  for (let i = 0; i < numCPUs; i += 1) {
    app.log.info(`Forking process number ${i}...`)
    cluster.fork()
  }
}

const start = async () => {
  try {
    await app.listen(3000, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

function childProcess () {
  app.log.info(`Worker ${process.pid} started...`)
  start()
}

if (numCPUs > 1) {
  if (cluster.isMaster) {
    masterProcess()
  } else {
    childProcess()
  }
} else {
  start()
}
