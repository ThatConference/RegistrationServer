
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

    //adjust for odd mismatches
    if (shirt.toUpperCase().includes('MEN XX-LARGE'))
      newShirt = 'Men 2X-Large';
    else if (shirt.toUpperCase().includes('WOMEN\'S-CUT XX-LARGE'))
      newShirt = 'Women\'s-cut 2X-Large'
    else if (shirt.toUpperCase().includes('MEN XXX-LARGE'))
      newShirt = 'Men 3X-Large'


    //adjust for lack of availability from vendor
    if (shirt.toUpperCase().includes('Youth XS'.toUpperCase()))
      newShirt = 'Youth S     [6-8]' // hardcoded based on what is in tito, has to match
    if (shirt.toUpperCase().includes('Women\'s-cut 4X-Large'.toUpperCase()))
      newShirt = 'Men 4X-Large' // hardcoded based on what is in tito, has to match

    return newShirt
  }

  return { isSponsor, isSpeaker, isSponsoredSpeaker, bitShiftShirts}
}

module.exports = titoHelper
