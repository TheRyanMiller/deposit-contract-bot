let postTask = cron.schedule("0 9,18 * * *", () => {
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