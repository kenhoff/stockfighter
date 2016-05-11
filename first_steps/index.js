API_KEY = "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
ACCOUNT = "SW463434"
VENUE = "MLELEX" // or exchange
STOCK = "WDS"
QTY = 100
PRICE = 30

var request = require('request');

// https://api.stockfighter.io/ob/api/venues/:venue/stocks/:stock/orders




// get current order book

opts = {
	method: "get",
	url: "https://api.stockfighter.io/ob/api/venues/" + VENUE + "/stocks/" + STOCK + "/quote",
	headers: {
		"X-Starfighter-Authorization": API_KEY,
	}
}


request(opts, function(err, response, body) {
	console.log(JSON.parse(body).ask);

	// buy 10 at current ask price
	opts = {
		method: "post",
		url: "https://api.stockfighter.io/ob/api/venues/" + VENUE + "/stocks/" + STOCK + "/orders",
		body: {
			venue: VENUE,
			stock: STOCK,
			account: ACCOUNT,
			price: JSON.parse(body).ask,
			direction: "buy",
			qty: QTY,
			orderType: "limit",
		},
		json: true,
		headers: {
			"X-Starfighter-Authorization": API_KEY,
		}
	}
	request(opts, function(err, response, body) {
		console.log(body);
	})

})



// buy 10 at 2000


order_id = 5256

// opts = {
// 	method: "get",
// 	url: "https://api.stockfighter.io/ob/api/venues/" + VENUE + "/stocks/" + STOCK + "/orders/" + order_id,
// 	headers: {
// 		"X-Starfighter-Authorization": API_KEY,
// 	}
// }

// opts = {
// 	method: "delete",
// 	url: "https://api.stockfighter.io/ob/api/venues/" + VENUE + "/stocks/" + STOCK + "/orders/" + order_id,
// 	headers: {
// 		"X-Starfighter-Authorization": API_KEY,
// 	}
// }
