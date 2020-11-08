let percentage = 50;
let min_size = 1; //Must be > 0
let max_size = 10;

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

console.log(make_bar(percentage, bar_styles[10], min_size, max_size).str + " " + percentage +"%");