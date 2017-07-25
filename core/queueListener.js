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
      Promise.all([ThatConference.checkIn(ticket.val())]).then( () => {

        let update = {}
        update[`${ticketPath}/registrationStatus/tcCheckedIn`] = true
        database.ref().update(update)

        console.log("resolved")
        resolve()
      }, () => {
        console.log("rejected")
        reject()
      })
    })
  })

  process.on('SIGINT', function() {
    Logger.info(`Starting queue shutdown`)

    queue.shutdown().then(function() {
      Logger.info(`Finished queue shutdown`)
      process.exit(0)
    })
  })

}
