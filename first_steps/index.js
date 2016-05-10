API_KEY = "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
ACCOUNT = "RFB94815444"
VENUE = "TPPEX"
STOCK = "QHY"
QTY = 10

var request = require('request');

// https://api.stockfighter.io/ob/api/venues/:venue/stocks/:stock/orders


opts = {
	method: "post",
	url: "https://api.stockfighter.io/ob/api/venues/CMSBEX/stocks/UOYH/orders",
	form: {
		qty: QTY
	}
}

request(opts, function(err, response, body) {
	console.log(body);
})
