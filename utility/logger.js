const Winston = require('winston')

const levels = {
  trace: 0,
  input: 1,
  verbose: 2,
  prompt: 3,
  debug: 4,
  info: 5,
  data: 6,
  help: 7,
  warn: 8,
  error: 9
}
const colors = {
  trace: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red'
}

Winston.addColors(colors)

let logger = Winston.createLogger({
  levels: levels,
  transports: [
    new Winston.transports.Console({
      level: 'error',
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: true
    })
  ]
})





// logger.add(Winston.transports.Console, {
//   level: 'error',
//   prettyPrint: true,
//   colorize: true,
//   silent: false,
//   timestamp: true
// })

module.exports = logger
