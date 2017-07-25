const logger = require('../utility/logger')

exports.add = (database) => {
  return function (request, reply) {
    let task = typeof request.payload === 'string'
      ? JSON.parse(request.payload) : request.payload;

    database.addToQueue(task)
    reply("added?")
  }
}
