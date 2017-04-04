const Request = require('request')
const logger = require('../utility/logger')

let options = {
  url: '',
  host: 'localhost',
  path: '/',
  port: 443,
  method: 'POST',
  headers: {
    Accept: 'application/json',
    Authorization: `Token token=${process.env.THATCONFERENCE_API_TOKEN}`
  }
}

exports.setNFCTag = (nfcTag, callback) => {
  /*
  TODO
    Call That Conference and setting the NFC tag for a badge
  */
  logger.info(`TODO: call That Conference setting nfc tag data`)
  callback("success call That Conference setting nfc tag data")  
}
