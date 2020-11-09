const axios = require('axios').default;
const web3 = require('web3');
const Twitter = require('twitter');
const cron = require('node-cron');
const commaNumber = require('comma-number');
require('dotenv').config();

let url = "https://api.etherscan.io/api?module=account&action=balance&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&tag=latest&apikey=YourApiKeyToken";
let balance = 0;
let numValidators = 0;
let minEthNeeded = 524288;
let requiredEth = 0;
let min_size = 20; //Must be > 0
let max_size = 20;
let statusBar = "";

let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var bar_styles = [
    '▁▂▃▄▅▆▇█',
    '⣀⣄⣤⣦⣶⣷⣿',
    '⣀⣄⣆⣇⣧⣷⣿',
    '○◔◐◕⬤',
    '□◱◧▣■',
    '□◱▨▩■',
    '□◱▥▦■',
    '░▒▓█',
    '░█',
    '⬜⬛',
    '▱▰',
    '▭◼',
    '▯▮',
    '◯⬤',
    '⚪⚫',
];
function make_bar(p, bar_style, min_size, max_size) {
    var d, full, m, middle, r, rest, x,
        min_delta = Number.POSITIVE_INFINITY,
        full_symbol = bar_style[bar_style.length-1],
        n = bar_style.length - 1;
    if(p == 100) return {str: repeat(full_symbol, 10), delta: 0};
    p = p / 100;
    for(var i=max_size; i>=min_size; i--) {
        x = p * i;
        full = Math.floor(x);
        rest = x - full;
        middle = Math.floor(rest * n);
        if(p != 0 && full == 0 && middle == 0) middle = 1;
        d = Math.abs(p - (full+middle/n)/i) * 100;
        if(d < min_delta) {
            min_delta = d;
            m = bar_style[middle];
            if(full == i) m = '';
            r = repeat(full_symbol, full) + m + repeat(bar_style[0], i-full-1);
        }
    }
    return {str: r, delta: min_delta};
}

function repeat(s, i) {
    var r = '';
    for(var j=0; j<i; j++) r += s;
    return r;
}

console.log("Starting bot...");
let postTask = cron.schedule("0 */12 * * *", () => {
    axios.get(url).then(resp => {
        contractBalance = (Number(web3.utils.fromWei(resp.data.result)) - 5).toFixed(0);
        numValidators = (contractBalance / 32).toFixed(0);
        percentage = (contractBalance/minEthNeeded*100).toFixed(1);
        requiredEth = minEthNeeded - contractBalance;
        console.log(contractBalance, numValidators);
        statusBar=make_bar(percentage, bar_styles[8], min_size, max_size).str + " " + percentage +"%";
        status = commaNumber(contractBalance)+" ETH has been staked in the Eth2 deposit contract. \n \n"+commaNumber(requiredEth)+" more ETH is needed to launch Eth2. \n \n"+statusBar;
        client.post('statuses/update', {status},  function(error, tweet, response) {
            if(error) console.log(error.response);
            else{
                //console.log(tweet);  // Tweet body.
                //console.log(response);  // Raw response object.
                console.log("Tweet successful.")
            }
        });
    })
});
