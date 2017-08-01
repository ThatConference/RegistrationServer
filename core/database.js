const logger = require('../utility/logger')

const Database = (database) => {

  const ticketsDB = database.ref("Orders")

  const add = (orderMap) => {
    for (let [key, value] of orderMap) {

      const tickets = Object.assign([], value.tickets) //copy the tickets out to be saved later
      delete(value.tickets) //remove tickets so firebase doesn't just add an array of non-indexed tickets.

      database.ref(`Orders/${key}`).set(value)

      for (const ticket of tickets) {
        database.ref(`Orders/${key}/tickets/${ticket.ticketId}`).set(ticket)
      }
    }
  }

  const destroy = () => {
    ticketsDB.once('value')
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key

          database.ref(`/Orders/${key}`).remove()
          logger.info(`Removed ticket - ${key}`)
        })
    })
  }

  const addToQueue = async (task) => {
    const tasks = database.ref("queue/tasks")
    await tasks.push(task);
  }

  const addNewOrder = (order) => {
    return new Promise((resolve, reject) => {
      logger.trace(`adding or updating new webhook order ( ${order.orderNumber} ) to db`)

      const orderPath = `Orders/${order.orderNumber}`
      database.ref(orderPath).once('value')
        .then((snapshot) => {
          logger.debug(`snapshot returned = ${snapshot.val()}`)

          if(snapshot.val() === null) {
            logger.debug(`Did not find order at ${orderPath}. creating.`)

            database.ref(`Orders/${order.orderNumber}`).set(order, (error) => {
              if(error)
                return reject(error)

              return resolve(`order created`)
            })
          } else {
            logger.info(`order already exists, updating...`)
            let returnedTicket = snapshot.val()

            //Loop through all the tickets we have on the registration
            for( let ticketId of Object.keys(order.tickets) ) {

              //Check to see if the db has the ticket already
              if (returnedTicket.tickets.hasOwnProperty(ticketId)) {
                logger.debug('db already contained ticket... updating ticket')
                let updatedTicket = order.tickets[ticketId]

                //Remove properties that we don't want to overwrite
                delete updatedTicket.tcDBKey
                delete updatedTicket.tcId
                delete updatedTicket.nfcTag
                delete updatedTicket.tcDBKey
                delete updatedTicket.registrationStatus

                logger.debug(`ticket graph to update`)
                logger.data(updatedTicket)

                database.ref(`Orders/${order.orderNumber}/tickets/${updatedTicket.ticketId}`).update(updatedTicket, (error) => {
                  if(error)
                    return reject(error)

                  return resolve(`order tickets updated - ${ticketId}`)
                })
              } else {
                logger.debug(`db did not contain ticket ${ticketId}`)
                database.ref(`Orders/${order.orderNumber}/tickets/${ticketId}`).set(order.tickets[ticketId], (error) => {
                  if(error)
                    return reject(error)

                  return resolve(`order tickets added - ${ticketId}`)
                })
              }
            }
          }
        })
    })
  }

  return { add, addToQueue, destroy, addNewOrder }
}

module.exports = Database
