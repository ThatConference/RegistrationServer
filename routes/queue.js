const logger = require('../utility/logger')

exports.add = (database) => {
  return function (request, reply) {
    let task = typeof request.payload === 'string'
      ? JSON.parse(request.payload) : request.payload;

    logger.data(`adding task to queue: ${JSON.stringify(request.payload)}`)

    database.addToQueue(task)
      .then( (response) => {
        logger.info(`added to queue`)
        reply(`queued: ${JSON.stringify(request.payload)}`).code(201)
      })
      .catch( (error) => {
        logger.error(error)
        reply(`queueing failed for: ${request.payload}`).code(400) //Wrong failure code..
      })
  }
}
