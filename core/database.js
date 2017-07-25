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

  return { add, addToQueue, destroy }
}

module.exports = Database

/* With Jack

const logger = require('../utility/logger')

const adder = (state) => (tickets) => {
  for (let ticket of tickets.data) {
    state.firebase.database().ref('Tickets/' + ticket.id).set({
      ticket: ticket,
      checkedIn: false
    })
  }
}

const destroyer = (state) => () =>  {
  state.ticketsDB.once('value')
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key
        state.firebase.database().ref('/Tickets/' + key).remove()
    })
  })
}

const Database = (firebase) => {
  const ticketsDB = firebase.database().ref("Tickets")
  const add = adder({ firebase })
  const destroy = destroyer({ firebase })

  return { add, destroy }
}

*/

//
// function () {
// //let adaRef = Firebase.database().ref("Tickets");
// var query = Firebase.database().ref("Tickets").orderByKey();
// query.once("value")
//   .then(function(snapshot) {
//     snapshot.forEach(function(childSnapshot) {
//       // key will be "ada" the first time and "alan" the second time
//       var key = childSnapshot.key
//       // childData will be the actual contents of the child
//       var childData = childSnapshot.val()
//       console.log(key, childData)
//   })
// });
//
//
// var ticketRef = Firebase.database().ref('Tickets');
// for(i = 0; i < 10; i++) {
//   var newTicket = ticketRef.push({
//     'user_id': i,
//     'text': 'ASDF, ASFD'
//   });
//   // newTicket.set({
//   //   'user_id': i,
//   //   'text': 'ASDF, ASFD'
//   // });
// }
//
