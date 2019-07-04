const { createLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, label, prettyPrint, colorize } = format;

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

addColors(colors);

const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
    colorize({all: true})
  ),
  transports: [new transports.Console()]
})

module.exports = logger
