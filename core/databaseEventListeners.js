const logger         = require('../utility/logger')
const thatConference = require('./thatconference')
const tito           = require('./tito')

module.exports = (database) => {
  logger.info(`starting db listeners`)
  let ticketsDB = database.ref('Tickets')

  //This  event runs everytime the process is started
  //TODO Put some logging and notificaiton in here so we know when we get new ones from TITO
  ticketsDB.on('child_added', (postSnapshot) => {
    const postId = postSnapshot.key
    logger.info(`added: ${postId}`)


    // Add a value listener to this event
    // TODO this should all be pulled into a seperate function
     postSnapshot.ref.child("checkedInState/mobile").on('value', (mobileDeviceUpdated) => {
       const checkedInState = mobileDeviceUpdated.val()
       logger.info(`checkedIn value has changed for ${postId} now ${checkedInState}`)

       /*
         TODO
         ? this could prolly just happen on the changed event
         ** Needs to be wrapped in a transaction.
         1. Call tito and check in user.
         2. Call that conference and add user record to it.
         3. Move record from here to another DB of checked in users with additional data?
       */
       if(checkedInState){
         logger.info(`Checking In: ${postSnapshot.val().ticket.attributes.name}`)

         //TODO this should be wrapped in a transaction and a promise.

         //Update NFC Tags on That Conference
         const nfcTag = postSnapshot.val().nfcTag
         thatConference.setNFCTag({tag: 1234}, (result) => {
           logger.debug(`nfcTag ID: ${nfcTag.id}`)
           logger.debug(`nfcTag Something: ${nfcTag.somethingElse}`)
         })

         tito.checkInUser({ticketUser: 1234}, (result) => {
           logger.debug(`TODO: ${result}`)
         })
       }
     })
  })

  ticketsDB.on('child_changed', (postSnapshot) => {
    const postReference = postSnapshot.ref
    const rowKey = postSnapshot.key
    logger.info(`row key: ${rowKey} changed`)
  })

  ticketsDB.on('child_removed', (postSnapshot) => {
    const postReference = postSnapshot.ref
    const uid = postSnapshot.val().uid
    const postId = postSnapshot.key
    logger.info(`removed: ${postId}`)
  })
}
