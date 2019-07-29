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

const levels = {
  error: 0,
  warn: 1,
  help: 2,
  data: 3,
  info: 4,
  debug: 5,
  prompt: 6,
  verbose: 7,
  input: 8,
  trace: 9
}

addColors(colors);

const logger = createLogger({
  levels: levels,
  format: combine(
    timestamp(),
    prettyPrint(),
    colorize({all: true})
  ),
  transports: [
    new (transports.Console)({
      level : 'trace'
    }),
  ],
})

module.exports = logger
