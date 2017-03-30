require('dotenv').config()

const Hapi     = require('hapi');
const Winston  = require('winston')
const Firebase = require('firebase')
const database = require('./core/database')

//firebase config
const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY       || '<API_KEY>',
  authDomain:        process.env.FIREBASE_PROJECT_ID    || '<PROJECT_ID>.firebaseapp.com',
  databaseURL:       process.env.FIREBASE_DB            || 'https://<DATABASE_NAME>.firebaseio.com',
  storageBucket:     process.env.FIREBASE_BUCKET        || '<BUCKET>.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID    || '<ID>'
}

Firebase.initializeApp(firebaseConfig);
const db = new database(Firebase)

const server = new Hapi.Server()
const port = Number(process.env.PORT || 8000)
server.connection({
  port: port
})

//Register our routes
server.route(require('./routes')(db))

exports.listen = () => {
  server.start( (err) => {
    if (err) {
      Winston.error(`Http server start error: ${err}`)
      throw err
    }

    Winston.info(`Http server listening on http://localhost:${port}`)
  })
}

exports.close = (next) => {
  server.stop(next)
}

const shouldStart = process.argv.find((n) => n === '--start')
if (shouldStart) {
  exports.listen()
}
