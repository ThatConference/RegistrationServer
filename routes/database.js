const logger = require('../utility/logger')

exports.destroy = (database) => {
  return function (request, h) {
    logger.info('Destroying Database was Called. Goodbye...')
    database.destroy()
    return 'destroyed'
  }
}
