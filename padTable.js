function padText(titleText, entryText){
  

    var padLeft;
    var padRight;
  
 
    var splitLength = (titleText.length - entryText.length)/2;
  
 
    var pad = '';
    for(var j=0; j < splitLength; j++){
      pad += ' ';
    }
  

    if(Number.isInteger(splitLength)){
      padLeft = pad;
      padRight = pad;
    }
    else{
      padLeft = pad;
      padRight = pad.substring(0, pad.length-1); // remove last space
    }
  
 
    return padLeft + entryText + padRight;
  }
  
  
 
  module.exports = padText;