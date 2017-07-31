const Request = require('request-promise-native')
const Moment = require('moment')
const Logger = require('../utility/logger')
const Helpers = require('../utility/helpers')
const TitoHelpers = require('../utility/titoHelpers')


let options = {
  url: '',
  host: 'localhost',
  path: '/',
  port: 443,
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: `Token token=${process.env.TITO_API_TOKEN}`
  }
}

const registrationDateCutoff = Moment(process.env.LATE_REGISTRATION_DATE, 'YYYY-MM-DD')

async function getCheckInTickets(){
  options.url = `https://${process.env.TITO_API_V1_HOST}/${process.env.TITO_CHECKIN_LIST_URI}/${process.env.TITO_CHECKIN_LIST_ID}`
  Logger.info(`Calling tito to get check in list, ${options.url}`)
  let checkinListMeta = JSON.parse(await Request.get(options))

  let tickets = []

  for (i = 1; i <= checkinListMeta.total_pages; i++) {
    let uri = `${checkinListMeta.tickets_url}\?page=${i}`
    options.url = uri

    let currentTickets = JSON.parse(await Request.get(options))
    tickets = tickets.concat(currentTickets.tickets)
  }
  return tickets
}

async function getTitoRegistrations() {
  options.url = `https://${process.env.TITO_API_HOST}/${process.env.TITO_API_PATH}/registrations`
  Logger.info(`Calling tito to get registrations, ${options.url}`)
  return JSON.parse(await Request.get(options)).data

  // return new Promise((resolve, reject) => {
  //   Request.get(options, (error, response, body) => {
  //     if(error){
  //       console.log(error)
  //       reject()
  //     }
  //     if(response.statusCode != 200 ){
  //       Logger.error(`status code: ${response.statusCode}`)
  //       reject()
  //     }
  //     console.log(body)
  //     //JSON.parse(body).data
  //     //resolve()
  //     reject()
  //   })
  //
  // })
}

async function populateDB ( database, reply ) {
  let replyResult = {}
  let [checkInList, regList] = await Promise.all([getCheckInTickets(), getTitoRegistrations()]) // no catching failed promise...

  Logger.info(`Tito returned ${checkInList.length} tickets on the checkin list`)
  Logger.info(`Tito returned ${regList.length} registrations`)

  // Map the orders
  let orders = remapIntoOrders(checkInList)
  Logger.info(`Total Tickets: ${orders.length}`)
  replyResult.orders = orders.length

  let mappedOrders = createOrderMap(orders)
  Logger.info(`Mapped Order Size: ${mappedOrders.size}`)
  replyResult.mappedOrders = mappedOrders.size

  let finalOrders = updateOrderMap(mappedOrders, regList)
  Logger.info(`Final Order Size: ${finalOrders.size}`)
  replyResult.finalOrders = finalOrders.size

  //map the orders in...
  addToDB(finalOrders, database)

  replyResult.status = 'success'
  reply(replyResult)
}

const remapIntoOrders = (tickets) => {
  Logger.debug(`Remapping Tickets into Orders....`)

  let uniqueTCIds = [] //will be used to store unique id's and validate later.

  return tickets.map( (t) => {

    let newOrder = {
      orderNumber: t.registration_reference,
      isSponsor: false,
      isSpeaker: false,
      isSponsoredSpeaker: false,
      tickets: []
    }

    //Get a "unique" id
    let uniqueId = Helpers.createUniqueId()

    //lookup in the array if we find one.
    while ( uniqueTCIds.includes(uniqueId) ) {
      //we found a unique id so let's try again
      Logger.debug(`Found a tcID that wasn't unique. Trying again.`)
      uniqueId = Helpers.createUniqueId()
    }
    //add the "unique id" to the array to check in the next cycle
    uniqueTCIds.push(uniqueId)

    let ticket = {
      tcDBKey: 0, //db key, and stupid decision. returned from checkin MUST BE SET TO 0! We assume it's there to be set later.
      tcId: uniqueId, // attendeeId cause we need two different ids. Set by us.
      titoTicketSlug: t.slug,
      orderId: t.registration_reference,
      ticketId: t.reference,
      fullName: t.name,
      firstName: t.first_name,
      lastName: t.last_name,
      type: t.release_title,
      email: t.email,
      staffMember: '',

      companyName: getCompanyName(t.answers),
      shirtSize: getShirtSize(t.answers),
      dietaryRestrictions: hasDietaryRestrictions(t.answers),
      isFirstTimeCamper: Boolean(isFirstTimeCamper(t.answers)),

      nfcTag: '',

      registrationStatus: {
        checkedIn: false,
        titoCheckedIn: false,
        tcCheckedIn: false
      }
    }

    //todo bug... this will always get reset..
    newOrder.isSponsor = newOrder.isSponsor ? true : TitoHelpers().isSponsor(ticket.type)
    newOrder.isSpeaker = newOrder.isSpeaker ? true : TitoHelpers().isSpeaker(ticket.type) // This would include sponsored speakers. Not sure if that is ok?
    newOrder.isSponsoredSpeaker = newOrder.isSponsoredSpeaker ? true : TitoHelpers().isSponsoredSpeaker(ticket.type)

    newOrder.tickets.push(ticket)

    return [t.registration_reference, newOrder]
  })
}

const getCompanyName = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.question.toUpperCase().includes('Company Name'.toUpperCase()))
      return acc + current.response
    return acc
  }, '')
}
const getShirtSize = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.question.toUpperCase().includes('t-shirt'.toUpperCase()))
      return acc + TitoHelpers().bitShiftShirts(current.response)
    return acc
  }, '')
}

const hasDietaryRestrictions = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.question.toUpperCase().includes('dietary'.toUpperCase()))
      return acc + current.response
    return acc
  }, '')
}

const isFirstTimeCamper = (answers) => {
  return answers.reduce( (acc, current) => {
    if (current.response.toUpperCase().includes('first time camper'.toUpperCase()))
      return acc + 1
    return acc
  }, 0)
}

const createOrderMap = (orders) => {
  Logger.debug(`Creating Order Map.`)
  Logger.debug(`Total Before Orders: ${orders.length}`)

  let orderMap = new Map()
  for (let order of orders) {

    let key = order[0]
    let value = order[1]

    if (orderMap.has(key))
      orderMap.get(key).tickets.push(value.tickets[0])
    else
      orderMap.set(key, value)
  }

  Logger.debug(`Total Unique Orders: ${orderMap.size}`)

  return orderMap
}

const updateOrderMap = (orderMap, registrations) => {

  for (let reg of registrations) {
    const key = reg.attributes.reference
    if (orderMap.has(key)){
      let order = orderMap.get(key)

      order.name = reg.attributes.name
      order.email = reg.attributes.email
      order.phoneNumber = reg.attributes["phone-number"]
      order.company = reg.attributes["billing-address"]["company-name"]
      order.completedAt = reg.attributes["completed-at"]
      order.isLateRegistration = Moment(reg.attributes['completed-at']).isAfter(registrationDateCutoff),

      orderMap.set(key, order)
    }
  }

  return orderMap
}

const addToDB = (orderMap, database) => {
  database.add(orderMap)
}

exports.seed = (database, reply) => {
  populateDB(database, reply)
}

exports.checkIn = (ticket, checkInList) => {

  let options = {
    //    https://api.tito.io/v2/an-account/awesome-conf/checkin_lists/awesome-conf-check-in-lists/checkins
    url: `https://${process.env.TITO_API_HOST}/v2/${process.env.TITO_CHECKIN_LIST_URI}/${process.env.TITO_CHECKIN_LIST_ID}/checkins`,
    headers: {
      Accept: 'application/json',
      Authorization: `Token token=${process.env.TITO_API_TOKEN}`
    },
    json: true
  }

  return new Promise((resolve, reject) => {
    const payload = mapCheckinPayload(ticket.titoTicketSlug, checkInList)

    Logger.data(`Tito Checkin Payload = ${JSON.stringify(payload)}`)
    Logger.data(`Tito Checkin Post Options = ${JSON.stringify(options)}`)

    options.body = payload

    Request.post(options, (error, response, body) => {
      if(error){
        Logger.error(error)
        return reject(error)
      }

      if(response.statusCode !== 201 ){
        Logger.error(`Checking in at Tito errored with status code: ${response.statusCode}`)
        return reject(response.statusCode)
      }

      Logger.info(`Tito checkin success for ticket \r\n ${JSON.stringify(ticket)}`)
      return resolve('Checked In At Tito')
    })
  })
}

/*
http://teamtito.github.io/tito-api-docs/#creating-a-new-check-in
https://api.tito.io/v2/an-account/awesome-conf/checkin_lists/awesome-conf-check-in-lists/checkins
{
  "data": {
    "type": "checkins",
    "attributes": {
      "created-at": "2016-12-01T08:30:00"
    },
    "relationships": {
      "checkin-list": {
        "data": {
          "type": "checkin-lists",
          "id": "awesomeconf-check-in-list"
        }
      },
      "ticket": {
        "data": {
          "type": "tickets",
          "id": "paul-awesomeconf-ticket"
        }
      }
    }
  }
}
*/

const mapCheckinPayload = (titoTicketSlug, checkinList ) => {
  return {
    data: {
      type: 'checkins',
      attributes: {
        ["created-at"]: Moment().utc().format(),
      },
      relationships: {
        ["checkin-list"]: {
          data: {
            type: 'checkin-lists',
            id: checkinList
          }
        },
        ticket: {
         data: {
           type: 'tickets',
           id: titoTicketSlug
          }
        }
      }
    }
  }
}
