const Logger         = require('../utility/logger')
const ThatConference = require('./thatConference')
const Tito           = require('./tito')

module.exports = (database) => {
  Logger.info(`starting db listeners`)
  let ticketsDB = database.ref('Orders')

  ticketsDB.on('child_removed', (postSnapshot) => {
    const postReference = postSnapshot.ref
    const uid = postSnapshot.val().uid
    const postId = postSnapshot.key
    Logger.info(`removed: ${postId}`)
  })
}
