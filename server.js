require('dotenv').config()

const Hapi              = require('hapi');

const logger            = require('./utility/logger')
const firebase          = require('./utility/firebase')
const database          = require('./core/database')
const databaseListeners = require('./core/databaseEventListeners')

const Firebase = require('firebase')

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY       || '<API_KEY>',
  authDomain:        process.env.FIREBASE_PROJECT_ID    || '<PROJECT_ID>.firebaseapp.com',
  databaseURL:       process.env.FIREBASE_DB            || 'https://<DATABASE_NAME>.firebaseio.com',
  storageBucket:     process.env.FIREBASE_BUCKET        || '<BUCKET>.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID    || '<ID>'
}

Firebase.initializeApp(firebaseConfig)
let fb = Firebase.database()

//start the event listeners
databaseListeners(fb)

const server = new Hapi.Server()
const port = Number(process.env.PORT || 8000)
server.connection({
  port: port
})

//Register our routes
server.route(require('./routes')(database(fb)))

exports.listen = () => {
  server.start( (err) => {
    if (err) {
      logger.error(`Http server start error: ${err}`)
      throw err
    }

    logger.info(`Http server listening on http://localhost:${port}`)
  })
}

exports.close = (next) => {
  server.stop(next)
}

if (require.main === module) {
    exports.listen()
}
