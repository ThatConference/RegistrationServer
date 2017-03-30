const Winston = require('winston')

exports.destroy = (database) => {
  return function (request, reply) {
    Winston.info('Database Destroy Called')
    database.destroy()
    reply('destroyed')
  }
}
