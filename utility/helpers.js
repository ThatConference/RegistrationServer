
  const getRandomInt = function( min, max ) {
   return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
  }

  exports.createUniqueId = () => {

    let length = 8;

    let ts = Date.now().toString();
    let parts = ts.split( "" ).reverse();
    let id = "";

    for( let i = 0; i < length; ++i ) {
     let index = getRandomInt( 0, parts.length - 1 );
     id += parts[index];
    }

    return parseInt(id);
  }
