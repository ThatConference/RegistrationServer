const Winston  = require('winston')

class Database {
  constructor(firebase) {
    this.firebase = firebase
    this.ticketsDB = this.firebase.database().ref("Tickets")

    this.ticketsDB.on('child_added', (postSnapshot) => {
      const postReference = postSnapshot.ref;
      const uid = postSnapshot.val().uid;
      const postId = postSnapshot.key;
      Winston.info(`added: ${postId}`)
    })

    this.ticketsDB.on('child_changed', (postSnapshot) => {
      const postReference = postSnapshot.ref;
      const uid = postSnapshot.val().uid;
      const postId = postSnapshot.key;
      Winston.info(`changed: ${postId}`)
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

// exports.destroy = () => {
//   ticketsDB.once('value')
//     .then(function(snapshot) {
//       snapshot.forEach((childSnapshot) => {
//         const key = childSnapshot.key
//         Firebase.database().ref('/Tickets/' + key).remove()
//     })
//   })
// }

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
// Firebase.database().ref('Tickets').on('child_added', function(postSnapshot) {
//   var postReference = postSnapshot.ref;
//   var uid = postSnapshot.val().uid;
//   var postId = postSnapshot.key;
//   console.log('added', postId)
// })
//
// Firebase.database().ref('Tickets').on('child_changed', function(postSnapshot) {
//   var postReference = postSnapshot.ref;
//   var uid = postSnapshot.val().uid;
//   var postId = postSnapshot.key;
//   console.log('updated', postId)
// })
//
// Firebase.database().ref('Tickets').on('child_removed', function(postSnapshot) {
//   var postReference = postSnapshot.ref;
//   var uid = postSnapshot.val().uid;
//   var postId = postSnapshot.key;
//   console.log('deleted', postId)
// })
//
// for(i = 0; i < 10; i++) {
//   Firebase.database().ref('Tickets/' + i).set({
//     username: 'jimmy' + i,
//     data: 'jimmy' + i,
//   });
// }
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
//
// // setTimeout(function (){
// //   var qq = Firebase.database().ref("Tickets").orderByKey();
// //   qq.once("value")
// //     .then(function(snapshot) {
// //       snapshot.forEach(function(childSnapshot) {
// //         var key = childSnapshot.key
// //         Firebase.database().ref('/Tickets/' + key).remove()
// //     })
// //   });
// // }, 5000)
//
// }
