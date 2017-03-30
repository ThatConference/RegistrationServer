const logger = require('../utility/logger')

module.exports = (database) => {
  logger.info(`starting db listeners`)

  let ticketsDB = database.ref("Tickets")

  /*
    This  event runs everytime the process is started
  */
  ticketsDB.on('child_added', (postSnapshot) => {
    const postReference = postSnapshot.ref
    const uid = postSnapshot.val().uid
    const postId = postSnapshot.key
    logger.info(`added: ${postId}`)

    // Add a value listener to this event
    postReference.child("checkedIn").on('value', (isCheckedIn) => {
      logger.info(`checkedIn value has changed for ${postId} now ${isCheckedIn.val()}`)
      if(isCheckedIn.val()){

        /*
          TODO

          ? this could prolly just happen on the changed event
          ** Needs to be wrapped in a transaction.

          1. Call tito and check in user.
          2. Call that conference and add user record to it.
          3. Move record from here to another DB of checked in users with additional data?
        */

        logger.info(`call tito and check in user`)
      }
    })
  })

  ticketsDB.on('child_changed', (postSnapshot) => {
    const postReference = postSnapshot.ref;
    const rowKey = postSnapshot.key;
    logger.info(`row key: ${rowKey} changed`)
    logger.info(`name on ticket: ${postSnapshot.val().ticket.attributes.name}`)

  })

  ticketsDB.on('child_removed', (postSnapshot) => {
    const postReference = postSnapshot.ref;
    const uid = postSnapshot.val().uid;
    const postId = postSnapshot.key;
    logger.info(`removed: ${postId}`)
  })
}
