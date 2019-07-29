const tito = require('../core/tito')
const order = require('../core/order')
const logger = require('../utility/logger')

/*
  only called to seed the db
    then we rely on the webhook to populate from that point onward.
*/
exports.seed = (database) => {
  return function (request, h) {
    logger.info('Tito Seed Called')
    return tito.seed(database, h)
  }
}

//Called by the tito webhook.
exports.addOrder = (database) => {
  return function (request, h) {
    let ticket = typeof request.payload === 'string'
      ? JSON.parse(request.payload) : request.payload

    logger.info(`adding new from tito webhook`)

    order.add(database, ticket)
      .then( (response) => {
        logger.info(`response: ${response}`)
        return h.response(response).code(201)
      })
      .catch( (error) => {
        logger.error(error)
        return h.response(error).code(400)
      })
  }
}
