const Twitter = require('twitter');
const facts = require('./eth2_facts');
const moment = require('moment');
const lc = require('letter-count');
require('dotenv').config();


let header = "==== BONUS ETH 2 FACT ==== \n\n";
let fact = "";

const findFact = () => {
    let today = moment().format('MM/DD');
    let isMorning = moment().format("HH") < 12;
    facts.forEach(item => {
        if(today==item.date) {
            if(isMorning==item.morning){
                fact=item.fact;
            }
        }
    })
    
}

findFact();
let message = header+fact;
console.log(message);
console.log("\nCharacter count: "+ lc.count(message, '-c').chars)


let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


// client.post('statuses/update', {status},  function(error, tweet, response) {
//     if(error) console.log(error);
//     else{
//         //console.log(tweet);  // Tweet body.
//         //console.log(response);  // Raw response object.
//         console.log("Tweet successful.")
//     }
// });