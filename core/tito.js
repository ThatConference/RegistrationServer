const Request = require('request-promise-native')
const Moment = require('moment')
const logger = require('../utility/logger')

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
  options.url = `https://${process.env.TITO_API_V1_HOST}/${process.env.TITO_CHECKIN_LIST}`
  logger.info(`Calling tito to get check in list, ${options.url}`)
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
  logger.info(`Calling tito to get registrations, ${options.url}`)

  return JSON.parse(await Request.get(options)).data
}

async function populateDB ( database, reply ) {
  let replyResult = {}
  let [checkInList, regList] = await Promise.all([getCheckInTickets(), getTitoRegistrations()])
  console.log(`check in list length: ${checkInList.length}`)
  console.log(`regList in list length: ${regList.length}`)

  logger.debug(`Tito returned ${checkInList.length} tickets`)
  logger.debug(`Tito returned ${regList.length} registrations`)

  // Map the orders
  let orders = remapIntoOrders(checkInList)
  replyResult.orders = orders.length

  let mappedOrders = createOrderMap(orders)
  replyResult.mappedOrders = mappedOrders.size

  let finalOrders = updateOrderMap(mappedOrders, regList)
  replyResult.finalOrders = finalOrders.size

  //map the orders in...
  addToDB(finalOrders, database)

  replyResult.status = 'success'
  reply(replyResult)
}

const remapIntoOrders = (tickets) => {
  logger.debug(`Remapping Tickets into Orders....`)
  return tickets.map( (t) => {

    let newOrder = {
      orderNumber: t.registration_reference,
      isSponsor: false,
      isSpeaker: false,
      isSponsoredSpeaker: false,
      tickets: []
    }

    let ticket = {
      orderId: t.registration_reference,
      ticketId: t.reference,
      fullName: t.name,
      firstName: t.first_name,
      lastName: t.last_name,
      type: t.release_title,
      email: t.email,

      companyName: t.answers.reduce( (acc, current) => {
        if (current.question.toUpperCase().includes('Company Name'.toUpperCase()))
          return acc + current.response
        return acc
      }, ''),

      shirtSize: t.answers.reduce( (acc, current) => {
        if (current.question.toUpperCase().includes('t-shirt'.toUpperCase()))
          return acc + current.response
        return acc
      }, ''),

      dietaryRestrictions: t.answers.reduce( (acc, current) => {
        if (current.question.toUpperCase().includes('dietary'.toUpperCase()))
          return acc + current.response
        return acc
      }, ''),

      isFirstTimeCamper: Boolean(t.answers.reduce( (acc, current) => {
        if (current.response.toUpperCase().includes('first time camper'.toUpperCase()))
          return acc + 1
        return acc
      }, 0)),

      nfcTag: '',

      registrationStatus: {
        checkedIn: false,
        titoCheckedIn: false,
        tcCheckedIn: false
      }
    }

    if(ticket.type.toUpperCase().includes('Expo'.toUpperCase()))
      newOrder.isSponsor = true;

    if(ticket.type.toUpperCase().includes('Counselor'.toUpperCase())) // This would include sponsored speakers. Not sure if that is ok?
      newOrder.isSpeaker = true;

    if(ticket.type.toUpperCase().includes('Sponsored Counselor'.toUpperCase()))
      newOrder.isSponsoredSpeaker = true;

    newOrder.tickets.push(ticket)

    return [t.registration_reference, newOrder]
  })
}

const createOrderMap = (orders) => {
  logger.debug(`Creating Order Map.`)
  logger.debug(`Total Before Orders: ${orders.length}`)

  let orderMap = new Map()
  for (let order of orders) {

    let key = order[0]
    let value = order[1]

    if (orderMap.has(key))
      orderMap.get(key).tickets.push(value.tickets[0])
    else
      orderMap.set(key, value)
  }

  logger.debug(`Total Unique Orders: ${orderMap.size}`)

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
