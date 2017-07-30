const Queue          = require('firebase-queue')
const Logger         = require('../utility/logger')

const ThatConference = require('./thatconference')
const Tito           = require('./tito')

module.exports = (database) => {
  Logger.info(`starting queue listeners`)
  //let ticketsDB = database.ref('Orders')

  let queueRef = database.ref('queue')

  /*

  default spec although we have a modified one on the queue to retry

  "default_spec": {
    "start_state": null,
    "in_progress_state": "in_progress",
    "finished_state": null,
    "error_state": "error",
    "timeout": 300000, // 5 minutes
    "retries": 0 // don't retry
  }
  */

  var queueOptions = {
    specId: 'regServerSpec',
    numWorkers: 5
  }

  let queue = new Queue(queueRef, queueOptions, (data, progress, resolve, reject) => {
    Logger.info(`Working item \r\n ${JSON.stringify(data)}`)
    progress(25)

    const ticketPath = `Orders/${data.orderNumber}/tickets/${data.ticketNumber}`
    let ticketRef = database.ref(ticketPath).once('value').then((ticket) => {

      let t = ticket.val()
      if ( t.tcDBKey === 0 ) {
        Logger.info(`Checking Into That Conference and Tito`)
        Promise.all([
          checkInAtThatConference(t, ticketPath, t.registrationStatus.tcCheckedIn, database ),
          checkInAtTito(t, ticketPath, process.env.TITO_CHECKIN_LIST_ID, t.registrationStatus.titoCheckedIn, database)
        ])
        .then ((results) => {
          Logger.info(`Checked Into That Conference and Tito`)
          resolve('Checked Into That Conference and Tito')
        })
        .catch( (error) => {
          Logger.error(`IS NOT -- Checked Into That Conference and Tito`)
          reject(`IS NOT -- Checked Into That Conference and Tito`)
        })
      } else {
        Logger.info(`Updating NFC Tag`)
        updateNfcTag(t, resolve, reject)
      }
    })
  })

  const checkInAtThatConference = (ticket, ticketPath, isCheckedIn, database) => {
    return new Promise((resolve, reject) => {
      if(!isCheckedIn) {
        ThatConference.addContact(ticket)
          .then( (checkIn) => {
            let update = {}
            update[`${ticketPath}/tcDBKey`] = checkIn.id
            update[`${ticketPath}/registrationStatus/tcCheckedIn`] = true
            database.ref().update(update)

            Logger.info(`Checked Into That Conference and Tito - resolved`)
            resolve('Checked Into That Conference and Tito')
          })
          .catch( (error) => {
            Logger.error(`Ticket Not Checked Into That Conference`)
            reject(`Ticket Not Checked Into That Conference`)
          })
      } else {
        Logger.info(`Ticket Already Checked into That Conference`)
        resolve(`Ticket Already Checked into That Conference`)
      }
    })
  }

  const checkInAtTito = (ticket, ticketPath, checkInList, isCheckedIn, database) => {
    return new Promise((resolve, reject) => {
      if (!isCheckedIn) {
        Tito.checkIn(ticket, checkInList)
        .then( (titoCheckedIn) => {
          let update = {}
          update[`${ticketPath}/registrationStatus/titoCheckedIn`] = true
          database.ref().update(update)

          Logger.info(`Checked In At Tito`)
          resolve('Checked Into Tito')
        })
        .catch( (error) => {
          Logger.error(`Tito CheckIn Rejected`)
          reject(`Tito CheckIn Rejected`)
        })
      } else {
        Logger.info(`Ticket already checked into tito`)
        resolve(`Ticket already checked into tito`)
      }
    })
  }

  const updateNfcTag = (ticket, resolve, reject) => {
    ThatConference.updateNfcTag(ticket)
      .then( (nfcTagResults) => {
        Logger.info(`${nfcTagResults}`)
        resolve('NFC Tage Updates')
      })
      .catch ((error) => {
        Logger.error(`NFC Tag Not Updated, ${error}`)
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
