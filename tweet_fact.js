const Twitter = require('twitter');
const facts = require('./eth2_facts');
const moment = require('moment');
const lc = require('letter-count');
require('dotenv').config();

module.exports = () => {
    let header = "==== BONUS ETH 2 FACT ==== \n\n";
    let fact = "";

    const findFact = () => {
        let today = moment().format('MM/DD');
        let isMorning = moment().format("HH") < 12;
        facts.forEach(item => {
            if(today==item.date) {
                if(isMorning==item.morning){
                    if(!!item.fact && item.fact!="") fact = item.fact;
                    return;
                }
            }
        })
        
    }

    findFact();
    if(fact==="" || !fact) return "";
    let message = header+fact;
    return message;
}

// client.post('statuses/update', {status},  function(error, tweet, response) {
//     if(error) console.log(error);
//     else{
//         //console.log(tweet);  // Tweet body.
//         //console.log(response);  // Raw response object.
//         console.log("Tweet successful.")
//     }
// });