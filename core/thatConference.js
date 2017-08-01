const Request = require('request')
const Logger = require('../utility/logger')
const Moment = require('moment')

let options = {
  url: '',
  headers: {
    ThatToken: `${process.env.THAT_CONFERENCE_TOKEN}`
  },
  json: true
}

exports.addContact = (order, ticket) => {
  Logger.trace('Adding Contact To That Conference')

  return new Promise((resolve, reject) => {
    if (ticket.nfcTag) {
      options.url = `${process.env.THAT_CONFERENCE_URI}/create`

      const payload = mapTicketToPayload(order, ticket)
      Logger.debug(`That Conference Add Contact Payload:`)
      Logger.data(payload)

      options.body = payload

      // POST: `vendor/api/contacts/create` returns int
      Request.post(options, (error, response, body) => {
        let uniqueId = parseInt(body)

        Logger.data(`TC Contact Id Returned: ${uniqueId}`)

        if(error){
          Logger.error(`Add TC Contact Post Error: ${error}`)
          return reject(error)
        }
        if(response.statusCode !== 200 ){
          Logger.error(`The Checkin Call To That Conference Returned != 200 -> \r\n status code: ${response.statusCode} \r\n payload: ${JSON.stringify(payload)}`)
          return reject(error)
        }

        Logger.info(`TC Result - ${response.statusCode}, for ${payload.AttendeeID} \r\n RESULT - ${JSON.stringify(payload)}`)
        return resolve({id: uniqueId})
      })
    } else{
      //don't check into that conference
      Logger.info(`Ticket did not contain an NFC Tag. Not added to thatconference.com`)
      resolve({id: -1})
    }

  })
}

exports.updateNfcTag = (ticket) => {
  Logger.trace('Calling That Conference to PUT new tagid')

  return new Promise((resolve, reject) => {

    // PUT: `vendor/api/contacts/{id}` ???
    // vendor/api/contacts/{Id}/{New NFC Tag}

    let nfcTagId = '0'
    if(ticket.nfcTag)
        nfcTagId = ticket.nfcTag

    options.url = `${process.env.THAT_CONFERENCE_URI}/${ticket.tcDBKey}/${nfcTagId}`

    Logger.debug(`That Conference Contact Add Post Options = ${JSON.stringify(options)}`)

    Request.put(options, (error, response, body) => {
      if(error){
        Logger.error(error)
        return reject(error)
      }

      if(response.statusCode !== 200 ){
        Logger.error(`The Update Call To That Conference Errored -> \r\n status code: ${response.statusCode}`)
        return reject({statusCode: response.statusCode})
      }

      Logger.info(`TC Result - ${response.statusCode}, for Ticket \r\n ${JSON.stringify(ticket)}`)
      return resolve('updated nfc tag was successful')
    })
  })

}

exports.deleteCheckin = (ticket) => {
  // DELETE: `vendor/api/contacts/{id}` (edited)
}


/* Example Ticket From Tito
  {
    "companyName": "That Conference, NFP",
    "dietaryRestrictions": "",
    "email": "someone@gmail.com",
    "firstName": "papa",
    "fullName": "papa camper",
    "isFirstTimeCamper": false,
    "lastName": "camper",
    "nfcTag": "111",
    "orderId": "5JRY",
    "registrationStatus": {
      "checkedIn": true,
      "tcCheckedIn": false,
      "titoCheckedIn": true
    },
    "shirtSize": "Men Small",
    "ticketId": "5JRY-6",
    "type": "Family Access - Child"
  }
*/

const mapTicketToPayload = (order, ticket) => {
  return {
    Id: ticket.tcDBKey,
    AttendeeID: ticket.tcId, //required
    NFCId: ticket.nfcTag, //required
    FirstName: ticket.firstName || order.name.split(' ')[0],                  //required
    LastName: ticket.lastName || order.name.split(' ')[1] || 'Not Supplied',  //required
    Email: ticket.email || order.email, //required
    CompanyName: ticket.companyName || order.company,
    Year: 2017
  }
}
