const Firebase = require('firebase')

module.export = () => {

  const Firebase = require('firebase')
  const firebaseConfig = {
    apiKey:            process.env.FIREBASE_API_KEY       || '<API_KEY>',
    authDomain:        process.env.FIREBASE_PROJECT_ID    || '<PROJECT_ID>.firebaseapp.com',
    databaseURL:       process.env.FIREBASE_DB            || 'https://<DATABASE_NAME>.firebaseio.com',
    storageBucket:     process.env.FIREBASE_BUCKET        || '<BUCKET>.appspot.com',
    messagingSenderId: process.env.MESSAGING_SENDER_ID    || '<ID>'
  }

  Firebase.initializeApp(firebaseConfig)
  let db = Firebase.database()

  return db
}
