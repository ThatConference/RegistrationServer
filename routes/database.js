const logger = require('../utility/logger')

exports.destroy = (database) => {
  return function (request, reply) {
    logger.info('Database Destroy Called')
    database.destroy()
    reply('destroyed')
  }
}
