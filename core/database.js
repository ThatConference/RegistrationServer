const logger = require('../utility/logger')

const Database = (database) => {
  const ticketsDB = database.ref("Tickets")

  const add = (tickets) => {
    for (let ticket of tickets.data) {
      database.ref('Tickets/' + ticket.id).set({
        ticket: ticket,
        checkedIn: false
      })
    }
  }

  const destroy = () => {
    ticketsDB.once('value')
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key
          database.ref('/Tickets/' + key).remove()
      })
    })
  }

  return { add, destroy }
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