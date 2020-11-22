const axios = require('axios').default;
const web3 = require('web3');
const Twitter = require('twitter');
const cron = require('node-cron');
const moment = require('moment');
const commaNumber = require('comma-number');
require('dotenv').config();

module.exports = () => new Promise ((resolve, reject) => {
    let url = "https://api.etherscan.io/api?module=account&action=balance&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&tag=latest&apikey=YourApiKeyToken";
    let balance = 0;
    let numValidators = 0;
    let minEthNeeded = 524288;
    let requiredEth = 0;
    let min_size = 20; //Must be > 0
    let max_size = 20;
    let statusBar = "";
    let today = moment();
    let targetDate = moment('2020-11-24' + 'T' + '12:00:00' + 'Z').utc();
    let minutesUntilTarget = targetDate.diff(today, 'minutes');


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

    let payload;


    axios.get(url).then(resp => {
        balance = (Number(web3.utils.fromWei(resp.data.result))).toFixed(0);
        numValidators = (balance / 32).toFixed(0);
        percent = (balance/minEthNeeded*100).toFixed(1);
        requiredEth = minEthNeeded - balance;
        statusBar=make_bar(percent, bar_styles[8], min_size, max_size).str + " " + percent +"%";
        let trend = (requiredEth/minutesUntilTarget).toFixed(0);
        status = commaNumber(balance)+" ETH has been staked in the Eth2 deposit contract. \n \n"+commaNumber(requiredEth)+" more ETH is needed to launch Eth2.\n\n"+statusBar; 
        payload = {status, balance, percent, requiredEth, trend};
        resolve(payload);
    })
})