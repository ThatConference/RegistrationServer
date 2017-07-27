
module.exports = (database) => {
  return [
    //{ method: 'GET', path: '/tito/seed', handler: require('./tito').seed(database) },
    { method: 'GET', path: '/ticket/seed', handler: require('./tito').seed(database) },
    { method: 'POST', path: '/ticket/add', handler: require('./tito').addTicket(database) },
    { method: 'DELETE', path: '/database/destroy', handler: require('./database').destroy(database) },
    { method: 'POST', path: '/queue/add', handler: require('./queue').add(database) }
  ]
}
