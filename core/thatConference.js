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

exports.addContact = (ticket) => {
  console.log("Add Contact Called")

  return new Promise((resolve, reject) => {
    if (ticket.nfcTag) {
      options.url = `${process.env.THAT_CONFERENCE_URI}/create`

      const payload = mapTicketToPayload(ticket)
      options.body = payload

      // POST: `vendor/api/contacts/create` returns int
      Request.post(options, (error, response, body) => {
        let uniqueId = parseInt(body)
        Logger.info(`TC Result Unique Id - ${uniqueId}`)

        if(error){
          console.log(error)
          // ?? Logger.error(`The Checkin Call To That Conference Errored -> \r\n status code: ${response.statusCode} \r\n error: ${JSON.stringify(error)} \r\n ticket: ${JSON.stringify(payload)}`)
          reject()
        }
        if(response.statusCode != 200 ){
          Logger.error(`The Checkin Call To That Conference Errored -> \r\n status code: ${response.statusCode} \r\n ticket: ${JSON.stringify(payload)}`)
          reject()
        }

        Logger.info(`TC Result - ${response.statusCode}, for ${payload.AttendeeID} \r\n RESULT - ${JSON.stringify(payload)}`)
        resolve({id: uniqueId})
      })
    } else{
      //don't check into that conference
      resolve({id: 0})
    }

  })
}

exports.updateNfcTag = (ticket) => {
  console.log('update contact called')
  return new Promise((resolve, reject) => {

    // PUT: `vendor/api/contacts/{id}` ???
    // vendor/api/contacts/{Id}/{New NFC Tag}
    options.url = `${process.env.THAT_CONFERENCE_URI}/${ticket.tcDBKey}/${ticket.nfcTag}`

    Request.put(options, (error, response, body) => {
      if(error){
        console.log(error)
        reject()
      }

      if(response.statusCode != 200 ){
        Logger.error(`The Update Call To That Conference Errored -> \r\n status code: ${response.statusCode}`)
        reject()
      }

      Logger.info(`TC Result - ${response.statusCode}, for Ticket \r\n ${JSON.stringify(ticket)}`)
      resolve('updated nfc tag was successful')
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

const mapTicketToPayload = (ticket) => {
  return {
    Id: ticket.tcDBKey, // TODO. What is the real name
    AttendeeID: ticket.tcId,
    NFCId: ticket.nfcTag,
    FirstName: ticket.firstName,
    LastName: ticket.lastName,
    Email: ticket.email,
    CompanyName: ticket.companyName,
    Title: "ticket.title", //don't have, would need to get off order
    City: "ticket.city",  // don't have, would need to get off order
    State: "ticket.state", // don't have, would need to get off order
    Country: "ticket.country", // don't have, would need to get off order
    Year: 2017
  }
}
