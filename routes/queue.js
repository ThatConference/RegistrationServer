const logger = require('../utility/logger')

exports.add = (database) => {
  return function (request, h) {
    let task = typeof request.payload === 'string'
      ? JSON.parse(request.payload) : request.payload;

    logger.data(`adding task to queue: ${JSON.stringify(request.payload)}`)

    database.addToQueue(task)
      .then( (response) => {
        logger.info(`added to queue`)
        return h.response(`queued: ${JSON.stringify(request.payload)}`).code(201)
      })
      .catch( (error) => {
        logger.error(error)
        return h.response(`queueing failed for: ${request.payload}`).code(400) //Wrong failure code..
      })
  }
}
