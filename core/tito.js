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

exports.getTickets = (database, reply) => {
  options.url = `https://${process.env.TITO_API_HOST}${process.env.TITO_API_PATH}`
  logger.debug(`Tito HTTP Request Options: \r\n ${options}`)

  Request(options, (error, response, payload) => {
    logger.debug(`Tito Returned: \r\n ${payload}`)

    const ticketsReturned = JSON.parse(payload)
    database.add(ticketsReturned)

    callback(ticketsReturned)
  })
}

exports.checkInUser = (user, callback) => {
  //TODO implement call to tito checking in users.
  // logger.info(`TODO - call tito checking in a user.`)
  // callback('call tito checking in a user.')
  //   const tickets = JSON.parse(body)
  //   database.add(tickets)
  //   console.log(`number of tickets: ${tickets.length}`)
  // })
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
