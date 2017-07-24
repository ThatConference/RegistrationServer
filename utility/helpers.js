

  exports.createUniqueId = () => {
    let id = new Date().getTime()
    id = id & 0xffffffff

    return id
  }


//module.exports = createUniqueId
