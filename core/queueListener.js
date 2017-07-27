const Queue          = require('firebase-queue')
const Logger         = require('../utility/logger')

const ThatConference = require('./thatconference')
const Tito           = require('./tito')

module.exports = (database) => {
  Logger.info(`starting queue listeners`)
  //let ticketsDB = database.ref('Orders')

  let queueRef = database.ref('queue');
  let queue = new Queue(queueRef, (data, progress, resolve, reject) => {
    Logger.info(`Working item \r\n ${JSON.stringify(data)}`)
    progress(25)

    const ticketPath = `Orders/${data.orderNumber}/tickets/${data.ticketNumber}`
    let ticketRef = database.ref(ticketPath).once('value').then((ticket) => {

      let t = ticket.val()
      if ( t.tcDBKey === 0 ) {
        Logger.info(`Adding and Checking In`)
        addAndCheckIn(t, ticketPath, process.env.TITO_CHECKIN_LIST_ID, resolve, reject)
      } else {
        Logger.info(`Updating NFC Tag`)
        updateNfcTag(t, resolve, reject)
      }
    })
  })

  const addAndCheckIn = (ticket, ticketPath, checkInList, resolve, reject) => {
    Promise.all([ThatConference.addContact(ticket), Tito.checkIn(ticket, checkInList)]).then( ([checkIn, titoCheckedIn]) => {
      let update = {}
      update[`${ticketPath}/tcDBKey`] = checkIn.id
      update[`${ticketPath}/registrationStatus/tcCheckedIn`] = true
      update[`${ticketPath}/registrationStatus/titoCheckedIn`] = true
      database.ref().update(update)

      Logger.info("resolved")
      resolve('Checked Into That Conference and Tito')
    }, () => {
      Logger.info("Add and CheckIn Rejected")
      reject("Add and CheckIn Rejected")
    })
  }

  const updateNfcTag = (ticket, resolve, reject) => {
    Promise.all([ThatConference.updateNfcTag(ticket)]).then( ([nfcTagResults]) => {
      Logger.info(`${nfcTagResults}`)
      resolve('NFC Tage Updates')
    }, () => {
      Logger.info(`NFC Tag Not Updated`)
      reject(`NFC Tag Not Updated`)
    })
  }

  process.on('SIGINT', function() {
    Logger.info(`Starting queue shutdown`)

    queue.shutdown().then(function() {
      Logger.info(`Finished queue shutdown`)
      process.exit(0)
    })
  })
}
