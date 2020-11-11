const Twitter = require('twitter');
const cron = require('node-cron');
const database = require('./dbSchemas');
const buildTweet = require('./build_tweet');
const tweet_fact = require('./tweet_fact');
const commaNumber = require('comma-number');
const lc = require('letter-count');
require('dotenv').config();


console.log("Before DB")
database.values.findOne({}).sort({created_at:-1}).then(dbResult=>{
    console.log("DB")
    buildTweet().then(result=>{
        // Prepare differences tweet
        console.log("-----MAIN TWEET----\n")
        console.log(result.status+"\n\n");

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
        console.log(tweet_fact())
    })
})