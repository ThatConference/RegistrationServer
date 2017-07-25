const Request = require('request')
const Logger = require('../utility/logger')
const Moment = require('moment')

let options = {
  url: `${process.env.THAT_CONFERENCE_URI}`,
  headers: {
    ThatToken: `${process.env.THAT_CONFERENCE_TOKEN}`
  },
  json: true
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

exports.checkIn = (ticket) => {

  return new Promise((resolve, reject) => {
    if (ticket.nfcTag) {

      let payload = {
        AttendeeID: ticket.attendeeId,
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

      options.body = payload

      Request.post(options, (error, response, body) => {
        if(error){
          console.log(error)
          // ?? Logger.error(`The Checkin Call To That Conference Errored -> \r\n status code: ${response.statusCode} \r\n error: ${JSON.stringify(error)} \r\n ticket: ${JSON.stringify(payload)}`)
          reject()
        }
        if(response.statusCode != 200 ){
          Logger.error(`The Checkin Call To That Conference Errored -> \r\n status code: ${response.statusCode} \r\n ticket: ${JSON.stringify(payload)}`)
          reject()
        }

        Logger.info(`TC Result - ${response.statusCode}, for ${payload.AttendeeID} \r\n ${JSON.stringify(payload)}`)
        resolve()
      })
    } else{
      //dnn't check into that conference
      resolve()
    }

  })
}
