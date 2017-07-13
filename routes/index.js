
module.exports = (database) => {
  return [
    //{ method: 'GET', path: '/tito/seed', handler: require('./tito').seed(database) },
    { method: 'GET', path: '/tito/seed', handler: require('./tito').seed(database) },
    { method: 'DELETE', path: '/database/destroy', handler: require('./database').destroy(database) }
  ]
}
