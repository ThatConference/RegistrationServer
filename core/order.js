const Moment = require('moment')
const Logger = require('../utility/logger')
const Helpers = require('../utility/helpers')
const TitoHelpers = require('../utility/titoHelpers')

const registrationDateCutoff = Moment(process.env.LATE_REGISTRATION_DATE, 'YYYY-MM-DD')

exports.add = (database, registration) => {
  return new Promise((resolve, reject) => {

    let newOrder = createOrder(registration)
    let uniqueTCIds = [] //will be used to store unique id's and validate later.

    for ( let ticket of registration.tickets ) {
      let uniqueId = Helpers.createUniqueId()

      while ( uniqueTCIds.includes(uniqueId) ) {
        Logger.debug(`Found a tcID that wasn't unique. Trying again.`)
        uniqueId = Helpers.createUniqueId()
      }

      uniqueTCIds.push(uniqueId)

      let mappedTicket = remapTicket(newOrder.orderNumber, uniqueId, ticket)

      console.log("CLARK", mappedTicket[`${ticket.reference}`].type)
      newOrder.isSponsor = newOrder.isSponsor ? true : TitoHelpers().isSponsor(mappedTicket[`${ticket.reference}`].type)
      newOrder.isSpeaker = newOrder.isSpeaker ? true : TitoHelpers().isSpeaker(mappedTicket[`${ticket.reference}`].type)
      newOrder.isSponsoredSpeaker = newOrder.isSponsoredSpeaker ? true : TitoHelpers().isSponsoredSpeaker(mappedTicket[`${ticket.reference}`].type)

      Object.assign(newOrder.tickets, mappedTicket)
    }

    console.log(JSON.stringify(newOrder))

    /*
    TODO we're gonna need to check if it already exists.....
    if it was, need to push new tickets to it?? Not sure...
    */

    resolve(`added ticket # ${newOrder.orderNumber}`)
    //addNewOrderToDB(newOrder, database)
  })
}

const addNewOrderToDB = (newOrder, database) => {
  database.addNewOrder(newOrder)
}

const createOrder = (registration) => {
  return {
    orderNumber: registration.reference,
    name: registration.name,
    email: registration.email,
    phoneNumber: registration["phone_number"],
    company: registration["company_name"],
    completedAt: registration["completed_at"],
    isLateRegistration: Moment(registration['completed_at']).isAfter(registrationDateCutoff),

    isSponsor: false,
    isSpeaker: false,
    isSponsoredSpeaker: false,
    tickets: {}
  }
}

const remapTicket = (orderNumber, tcId, ticket) => {
  return {
    [`${ticket.reference}`]: {
      tcDBKey: 0,                         //db key, and stupid decision. returned from checkin MUST BE SET TO 0! We assume it's there to be set later.
      tcId: tcId, //todo                    // attendeeId cause we need two different ids. Set by us.
      titoTicketSlug: ticket.slug,
      orderId: orderNumber,
      ticketId: ticket.reference,
      fullName: ticket.name,
      firstName: ticket.first_name,
      lastName: ticket.last_name,
      type: ticket.release_title,
      email: ticket.email,
      staffMember: '',

      companyName: ticket.company_name,

      shirtSize: getShirtSize(ticket.answers),
      dietaryRestrictions: hasDietaryRestrictions(ticket.answers),
      //isFirstTimeCamper: Boolean(isFirstTimeCamper(ticket.answers)),

      nfcTag: '',
      registrationStatus: {
        checkedIn: false,
        titoCheckedIn: false,
        tcCheckedIn: false
      }
    }
  }
}

const getShirtSize = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.question.title.toUpperCase().includes('t-shirt'.toUpperCase()))
      return acc + TitoHelpers().bitShiftShirts(current.response)
    return acc
  }, '')
}

const hasDietaryRestrictions = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.question.title.toUpperCase().includes('dietary'.toUpperCase()))
      return acc + current.response
    return acc
  }, '')
}

// const isFirstTimeCamper = (answers) => {
//   return answers.reduce( (acc, current) => {
//     if (current.response.toUpperCase().includes('first time camper'.toUpperCase()))
//       return acc + 1
//     return acc
//   }, 0)
// }

//Call and get the regisration
//https://api.tito.io/v2/an-account/awesome-conf/registrations/paul-awesomeconf-registration

// let url = `https://api.tito.io/v2/that-conference/that-conference-2017/registrations/${ticket.id}?include=tickets`
// options.url = url
//
// Logger.debug(`Calling tito tito registration for ${ticket.id}`)
// Logger.data(`request options ${options.url}`)
//
// Request.get(options, (error, response, body) => {
//   if(error){
//     let message = `Call to get regisration for ${ticket.id} failed: ${JSON.stringify(error)}`
//     Logger.error(message)
//     return reject(message)
//   }
//
// })
