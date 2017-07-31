
const titoHelper = () => {

  const isSponsor = (ticketType) => {
    if(ticketType.toUpperCase().includes('Expo'.toUpperCase()))
      return true
    else
      return false
  }

  const isSpeaker = (ticketType) => {
    if(ticketType.toUpperCase().includes('Counselor'.toUpperCase()))
      return true
    else
      return false
  }

  const isSponsoredSpeaker = (ticketType) => {
    if(ticketType.toUpperCase().includes('Sponsored Counselor'.toUpperCase()))
      return true
    else
      return false
  }

  //youth shirts had a few sizes in that we're wrong. We need to adjust.
  const bitShiftShirts = (shirt) => {
    let newShirt = shirt

    if (shirt.toUpperCase().includes('Youth XS'.toUpperCase()))
      newShirt = 'Youth S     [6-8]' // hardcoded based on what is in tito, has to match

    if (shirt.toUpperCase().includes('Youth XL'.toUpperCase()))
      newShirt = 'Men X-Small' // hardcoded based on what is in tito, has to match

    return newShirt
  }

  return { isSponsor, isSpeaker, isSponsoredSpeaker, bitShiftShirts}
}

module.exports = titoHelper
