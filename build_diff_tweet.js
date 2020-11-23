const Twitter = require('twitter');
const commaNumber = require('comma-number');
const lc = require('letter-count');
const moment = require('moment');

require('dotenv').config();

let min_size = 20; //Must be > 0
let max_size = 20;

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

const buildTimeMeter = () => {
    let contractDeployDate = moment('2020-11-04' + 'T' + '15:15:20' + 'Z').utc();
    let eth2LaunchDate = moment('2020-11-24' + 'T' + '12:00:00' + 'Z').utc();
    let totalMinutes = eth2LaunchDate.diff(contractDeployDate,'minutes');
    let minutesUntilLaunch = eth2LaunchDate.diff(moment().utc(),'minutes');
    let minutesElapsed = totalMinutes-minutesUntilLaunch;
    let percentElapsed = (minutesElapsed/totalMinutes*100).toFixed(1);
    let timeBar=make_bar(percentElapsed, bar_styles[8], min_size, max_size).str + " " + percentElapsed +"%";
    return timeBar;
}

module.exports = (result,dbResult) => {
    let differencesTweet = "";
    let percentGain = (result.percent - dbResult.percent).toFixed(1);
    let stakeGain = commaNumber((result.balance - dbResult.balance).toFixed(0));
    let eth2LaunchDate = moment('2020-11-24' + 'T' + '12:00:00' + 'Z').utc();
    let minutesUntilLaunch = eth2LaunchDate.diff(moment().utc(),'minutes');
    differencesTweet=commaNumber(stakeGain)+" ETH staked in past hour.\n\n";
    differencesTweet+=percentGain+"% gain toward genesis in past hour.\n\n";    
    differencesTweet+="Time elapsed from first deposit until minimum genesis target: \n"+buildTimeMeter();
    //differencesTweet+="\n\n"+commaNumber(result.trend)+" ETH daily trend is needed to hit genesis target.";
    return differencesTweet;
}