const buildTweet = require('./build_tweet');

buildTweet().then(result=>{
    console.log(result.status)
});