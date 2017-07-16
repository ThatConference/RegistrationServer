const Firebase = require('firebase')
const Admin = require("firebase-admin");
const ServiceAccount = require(`../${process.env.FIREBASE_TOKEN}`);

const firebaseConfig = {
  credential: Admin.credential.cert(ServiceAccount),
  apiKey: process.env.FIREBASE_API_KEY || '<API_KEY>',
  authDomain: process.env.FIREBASE_PROJECT_ID || '<PROJECT_ID>.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DB || 'https://<DATABASE_NAME>.firebaseio.com',
  storageBucket: process.env.FIREBASE_BUCKET || '<BUCKET>.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID || '<ID>'
}

Firebase.initializeApp(firebaseConfig)

module.exports = Firebase.database()
