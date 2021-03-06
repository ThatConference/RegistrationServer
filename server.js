require('dotenv').config()

const Hapi = require('hapi')

const logger = require('./utility/logger')
const firebase = require('./utility/firebase')
const database = require('./core/database')
const queueListener = require('./core/queueListener')

// start the queue listeners
queueListener(firebase)

const port = Number(process.env.PORT || 8000)
const server = new Hapi.Server({port: port})

// Register our routes
server.route(require('./routes')(database(firebase)))

exports.listen = () => {
  server.start((err) => {
    if (err) {
      logger.error(`Http server start error: ${err}`)
      throw err
    }

    logger.info(`Http server listening on http://localhost:${port}`)
  })
}

exports.close = (next) => {
  server.stop(next)
}

if (require.main === module) {
  exports.listen()
}
