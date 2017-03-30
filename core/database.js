const logger = require('../utility/logger')

class Database {
  constructor(firebase) {
    this.firebase = firebase
    this.ticketsDB = this.firebase.database().ref("Tickets")
  }

  add(tickets){
    for (let ticket of tickets.data) {
      this.firebase.database().ref('Tickets/' + ticket.id).set({
        ticket: ticket,
        checkedIn: false
      })
    }
  }

  destroy(){
    this.ticketsDB.once('value')
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key
          this.firebase.database().ref('/Tickets/' + key).remove()
      })
    })
  }
}

module.exports = Database

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
