const Request = require('request')
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

exports.seed = (database, reply) => {
  let checkInList, regList

  let p1 = new Promise( (resolve, reject) => {
    options.url = `https://${process.env.TITO_API_V1_HOST}/${process.env.TITO_CHECKIN_LIST}`

    logger.info('Calling tito to get checkin list')

    Request(options, (error, response, payload) => {
      checkInList = JSON.parse(payload)
      resolve()
    })
  })

  let p2 = new Promise((resolve, reject) => {
    options.url = `https://${process.env.TITO_API_HOST}/${process.env.TITO_API_PATH}/registrations`

    logger.info('Calling tito to get registrations')

    Request(options, (error, response, payload) => {
      regList = JSON.parse(payload)
      resolve()
    })
  })

  // now do the mapping..
  Promise.all([p1, p2]).then(() => {

    logger.debug(`Tito returned ${checkInList.tickets.length} tickets`)
    logger.debug(`Tito returned ${regList.data.length} registrations`)

    // Map the orders
    let orders = remapIntoOrders(checkInList.tickets)
    let mappedOrders = createOrderMap(orders)

    let finalOrders = updateOrderMap(mappedOrders, regList.data)

    //map the orders in...
    addToDB(finalOrders, database)
  })
}

const remapIntoOrders = (tickets) => {
  logger.debug(`Remapping Tickets into Orders....`)
  return tickets.map( (t) => {

    let newOrder = {
      orderNumber: t.registration_reference,
      address: {
        street: '123'
      },
      tickets: []
    }

    let ticket = {
      id: t.reference,
      firstNmae: t.first_name,
      lastName: t.last_name,
      nfcTag: 0
    }

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

      orderMap.set(key, order)
    }
  }

  return orderMap
}

const addToDB = (orderMap, database) => {
  database.add(orderMap)
}

exports.seedTestTickets = (database, reply) => {
  database.addTestData([order])
  reply('seeded')
}

var order = {

  orderNumber: '44444',
  isSpeaker: false,
  isSponsor: false,
  discountCode: 'asdf',

  firstName: 'Johnny',
  lastName: 'Appleseed',
  email: 'clark@unspecified.io',
  company: 'unspecified llc',

  address: {
    street: '9109 carol lane',
    city: 'spring grove',
    state: 'il'
  },

  registrationState: {
    registered: false,
    thatConference: false,
    tito: false
  },

  tickets: [
    {
      id: '5JRY-1',
      type: 'Attendee',
      name: 'Keith Burnell',
      shirtSize: 'adult medium',
      nfcTag: {
        id: 1234,
        displayName: 'Keith'
      }
    },

    {
      id: '5JRY-2',
      type: 'Attendee',
      name: 'Sally Burnell',
      shirtSize: 'adult skinny',
      nfcTag: {
        id: 1234,
        displayName: 'Keith'
      }
    }
  ]
}
