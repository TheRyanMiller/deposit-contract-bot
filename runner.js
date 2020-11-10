const Twitter = require('twitter');
const cron = require('node-cron');
const database = require('./dbSchemas');
const buildTweet = require('./build_tweet');
const tweet_fact = require('./tweet_fact');
const commaNumber = require('comma-number');
const lc = require('letter-count');
require('dotenv').config();

let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let client2 = new Twitter({
    consumer_key: process.env.TWITTER2_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER2_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER2_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER2_ACCESS_TOKEN_SECRET
});



console.log("Starting bot...\n\n");

let cronValue = "0 21 * * *";

let postTask = cron.schedule(cronValue, () => {
    database.values.findOne({}).sort({created_at:-1}).then(dbResult=>{
        buildTweet().then(result=>{

            // Save new result
            let newValues = new database.values({
                percent: result.percent.replace(/,/g, ""),
                balance: result.balance.replace(/,/g, ""),
                trend: result.trend,
                created_at: new Date()
            });
            newValues.save( err => { if(err) throw err } )

            // Prepare differences tweet
            console.log("-----PREPARE DIFFERENCES TWEET----")
            let differencesTweet = "";
            let percentGain = (result.percent - dbResult.percent).toFixed(1);
            let stakeGain = commaNumber((result.balance - dbResult.balance).toFixed(0));
            differencesTweet=commaNumber(stakeGain)+" ETH staked since last tweet.\n\n";
            differencesTweet+=percentGain+"% gain toward genesis since last tweet.\n\n";
            if(dbResult.trend>result.trend){
                console.log("NEGATIVE TREND!!!!");
            }
            if(dbResult.trend<result.trend) console.log("POSITIVE TREND!!!!")
            differencesTweet+=commaNumber(result.trend)+" ETH daily trend is needed for December 1st genesis.";
            console.log(differencesTweet)
            console.log("\nCharacter count: "+ lc.count(differencesTweet, '-c').chars)
            console.log();

            console.log();
            // Prepare Facts Tweet
            console.log("-----PREPARE FACTS----")
            let factsTweet = tweet_fact();

            client.post('statuses/update', {status:result.status},  function(error, tweet, response) {
                if(error) console.log(error.response);
                else{
                    //console.log(tweet);  // Tweet body.
                    //console.log(response);  // Raw response object.
                    console.log("Tweet 1 successful.");
                    client2.post('statuses/update', {
                        status:"@DepositEth "+differencesTweet,
                        in_reply_to_status_id: ""+tweet.id_str
                    },function(error, tweet2, response) {
                        if(error) console.log(error);
                        else{
                            console.log("Tweet 2 successful.");
                            if(factsTweet!=""){
                                client2.post('statuses/update', {
                                    status:"@EthDeposit "+factsTweet,
                                    in_reply_to_status_id: ""+tweet2.id_str
                                },function(error, tweet, response) {
                                    if(error) console.log(error);
                                    else{
                                        console.log("Tweet 3 successful.");
                                    }
                                })
                            }
                        }
                    })
                }
            });
        })
    })
})