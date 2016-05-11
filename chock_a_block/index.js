var Stockfighter = require('../api/stockfighter.js')

var tradebot = Stockfighter({
	api_key: "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
})

account = "PAP97439217"
setInterval(function() {
	tradebot.venue("RBCEX").stock("FSI").quote(function(err, data) {
		console.log(data.ask);
		if (data.ask) {
			tradebot.venue("RBCEX").stock("FSI").order({
				price: data.ask,
				qty: 300,
				direction: "buy",
				order_type: "limit",
				account_id: account
			})
		}
	})
}, 500)
