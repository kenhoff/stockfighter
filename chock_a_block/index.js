var Stockfighter = require('../api/stockfighter.js')({
	api_key: "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
});

account = "DMB57032352"



Stockfighter.venue("ASNYEX").stock("OIKN").order({
	account_id: account,
	price: 1,
	qty: 1,
	direction: "buy",
	order_type: "limit"
}, function(err, data) {
	console.log(data);
})
