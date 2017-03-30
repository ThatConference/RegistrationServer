const Tito    = require('../core/tito')
const Winston = require('winston')

exports.seed = (database) => {
  return function (request, reply) {
    Winston.info('Tito Seed Called')
    Tito.getTickets(database, reply)
  }
}

// exports.test = (request, reply) => {
//   Winston.info('Tito Seed Called')
//
//   var data = typeof request.payload === 'string'
//   ? JSON.parse(request.payload) : request.payload
//
//   Tito.getTickets(reply)
// }
