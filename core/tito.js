const Request = require('request')
const logger  = require('../utility/logger')

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

  Request(options, (error, response, body) => {
    logger.debug(`Tito Returned: \r\n ${body}`)

    const tickets = JSON.parse(body)
    database.add(tickets)

    callback(body)
  })
}
