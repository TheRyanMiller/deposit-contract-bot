const Twitter = require('twitter');
const cron = require('node-cron');
const database = require('./dbSchemas');
const buildTweet = require('./build_tweet');
const buildDiffTweet = require('./build_diff_tweet');
const moment = require('moment');
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

let cronValue = "0 * * * *";
let isProd = process.env.IS_PROD === "true" ? true : false;
let sendOn = process.env.SEND_ON === "true" ? true : false;;
let mainAccount = process.env.TEST_ACCT;
if(isProd) mainAccount = process.env.PROD_ACCT;

let replyAccount = process.env.REPLY_ACCT;

let run = () => {
    let d = moment().subtract({minutes:31});
    database.values.findOne({created_at: {$lt: d}}).sort({created_at:-1}).then(dbResult=>{
        buildTweet().then(result=>{
            
            if(isProd){
                // Save new result
                let newValues = new database.values({
                    percent: result.percent.replace(/,/g, ""),
                    balance: result.balance.replace(/,/g, ""),
                    trend: result.trend,
                    created_at: new Date()
                });
                newValues.save( err => { if(err) throw err } )
            }

            // Main Tweet
            console.log("\n-----MAIN TWEET----")
            console.log(result.status+"\n")
            console.log("\n->Character count: "+ lc.count(result.status, '-c').chars);

            // Prepare differences tweet
            console.log("\n-----PREPARE DIFFERENCES TWEET----")
            let differencesTweet = buildDiffTweet(result,dbResult);
            console.log(differencesTweet);
            console.log("\n->Character count: "+ lc.count(differencesTweet, '-c').chars);
            
            // Prepare Facts Tweet
            console.log("\n-----FACTS TWEET----")
            let factsTweet = tweet_fact();
            console.log(factsTweet)
            console.log("\n->Character count: "+ lc.count(factsTweet, '-c').chars);

            if(sendOn){
                client.post('statuses/update', {status:result.status},  function(error, tweet, response) {
                    if(error) console.log(error.response);
                    else{
                        //console.log(tweet);  // Tweet body.
                        //console.log(response);  // Raw response object.
                        console.log("Tweet 1 successful.");
                        client2.post('statuses/update', {
                            status:mainAccount+" "+differencesTweet,
                            in_reply_to_status_id: ""+tweet.id_str
                        },function(error, tweet2, response) {
                            if(error) console.log(error);
                            else{
                                console.log("Tweet 2 successful.");
                                if(factsTweet!=""){
                                    // client2.post('statuses/update', {
                                    //     status:replyAccount+" "+factsTweet,
                                    //     in_reply_to_status_id: ""+tweet2.id_str
                                    // },function(error, tweet, response) {
                                    //     if(error) console.log(error);
                                    //     else{                                  
                                    //         console.log("Tweet 3 successful.");
                                    //     }
                                    // })
                                }
                            }
                        })
                    }
                });
            }
        })
    })
}

if(isProd){
    let postTask = cron.schedule(cronValue, () => {
        run();
    })
}
else{
    run();
}