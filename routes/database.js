const logger = require('../utility/logger')

exports.destroy = (database) => {
  return function (request, reply) {
    logger.info('Destroying Database was Called. Goodbye...')
    database.destroy()
    reply('destroyed').code(200)
  }
}
