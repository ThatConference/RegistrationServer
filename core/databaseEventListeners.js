const Logger         = require('../utility/logger')
const ThatConference = require('./thatconference')
const Tito           = require('./tito')

module.exports = (database) => {
  Logger.info(`starting db listeners`)
  let ticketsDB = database.ref('Orders')

  ticketsDB.on('child_added', (order) => {
    order.ref.child('tickets').on('child_changed', function(ticket) {
      ticket.ref.child('registrationStatus/checkedIn').once('value', (t) => {
        if(t.val() === true) {
          Logger.info(`Calling TC to Check In - ${ticket.val().ticketId}`)
          ThatConference.checkIn(ticket.val())
          //      /*
          //        TODO
          //        ? this could prolly just happen on the changed event
          //        ** Needs to be wrapped in a transaction.
          //        1. Call tito and check in user.
          //        2. Call that conference and add user record to it.
          //        3. Move record from here to another DB of checked in users with additional data?
          //      */
        }
      })
    })
  })

  ticketsDB.on('child_removed', (postSnapshot) => {
    const postReference = postSnapshot.ref
    const uid = postSnapshot.val().uid
    const postId = postSnapshot.key
    Logger.info(`removed: ${postId}`)
  })
}
