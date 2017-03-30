const Winston  = require('winston')

class Database {
  constructor(firebase) {
    this.firebase = firebase
    this.ticketsDB = this.firebase.database().ref("Tickets")

    /*
      This  event runs everytime the process is started
    */
    this.ticketsDB.on('child_added', (postSnapshot) => {
      const postReference = postSnapshot.ref
      const uid = postSnapshot.val().uid
      const postId = postSnapshot.key
      Winston.info(`added: ${postId}`)

      // Add a value listener to this event
      postReference.child("checkedIn").on('value', (isCheckedIn) => {
        Winston.info(`checkedIn value has changed for ${postId} now ${isCheckedIn.val()}`)
        if(isCheckedIn.val()){

          /*
            TODO

            ? this could prolly just happen on the changed event
            ** Needs to be wrapped in a transaction.

            1. Call tito and check in user.
            2. Call that conference and add user record to it.
            3. Move record from here to another DB of checked in users with additional data?
          */

          Winston.info(`call tito and check in user`)
        }
      })
    })

    this.ticketsDB.on('child_changed', (postSnapshot) => {
      const postReference = postSnapshot.ref;
      const rowKey = postSnapshot.key;
      Winston.info(`row key: ${rowKey} changed`)
      Winston.info(`name on ticket: ${postSnapshot.val().ticket.attributes.name}`)

    })

    this.ticketsDB.on('child_removed', (postSnapshot) => {
      const postReference = postSnapshot.ref;
      const uid = postSnapshot.val().uid;
      const postId = postSnapshot.key;
      Winston.info(`removed: ${postId}`)
    })
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
