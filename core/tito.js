const Request = require('request')
const logger = require('../utility/logger')

let options = {
  url: '',
  host: 'localhost',
  path: '/',
  port: 443,
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: `Token token=${process.env.TITO_API_TOKEN}`
  }
}

exports.getTickets = (database, callback) => {
  options.url = `https://${process.env.TITO_API_HOST}${process.env.TITO_API_PATH}`
  logger.debug(`Tito HTTP Request Options: \r\n ${options}`)

  Request(options, (error, response, payload) => {
    logger.debug(`Tito Returned: \r\n ${payload}`)

    const ticketsReturned = JSON.parse(payload)
    database.add(ticketsReturned)

    callback(ticketsReturned)
  })
}

exports.checkInUser = (user, callback) => {
  //TODO implement call to tito checking in users.
  logger.info(`TODO - call tito checking in a user.`)
  callback('call tito checking in a user.')
}
