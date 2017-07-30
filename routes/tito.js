const tito = require('../core/tito')
const logger = require('../utility/logger')

/*
  only called to seed the db
    then we rely on the webhook to populate from that point onward.
*/
exports.seed = (database) => {
  return function (request, reply) {
    logger.info('Tito Seed Called')
    tito.seed(database, reply)
  }
}

//Called by the tito webhook.
exports.addTicket = (database) => {
  return function (request, reply) {
    let ticket = typeof request.payload === 'string'
      ? JSON.parse(request.payload) : request.payload;

    logger.info(`adding new ticket`)

    tito.addTicket(database, ticket)
      .then( (response) => {
        logger.info(`response: ${response}`)
        reply(response).code(201)
      })
      .catch( (error) => {
        logger.error(error)
        reply(error).code(400)
      })
  }
}
