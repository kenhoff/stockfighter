var Stockfighter = require('../api/stockfighter.js')

var tradebot = Stockfighter({
	api_key: "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
})

openOrders = []
position = 0 // number of shares in either direction
percentSpread = .1 // percentage of last trade price
quantity = 100


// buy increases position
// sell decreases position
// shouldn't go above 1000 or below 1000

tradebot.levels("sell_side").start(function(err, game) {
	if (err) {
		throw err
	}
	setInterval(() => {
		// cancel existing orders

		for (var i = 0; i < openOrders.length; i++) {
			openOrders[i]
			cancelOrder(openOrders[i])
		}
		openOrders = []
			// place new orders
		tradebot.venue(game.venues[0]).stock(game.tickers[0]).quote((err, quote) => {
			// console.log(quote);
			lastPrice = quote.last
			buyPrice = Math.round(quote.last - ((quote.last * percentSpread) / 2))
			sellPrice = Math.round(quote.last + ((quote.last * percentSpread) / 2))
			console.log("Last price:", lastPrice);
			console.log("Spread:", quote.last * percentSpread);
			// if position < 500, place buy order
			if (position < 500) {
				tradebot.venue(game.venues[0]).stock(game.tickers[0]).order({
					account: game.account,
					price: buyPrice,
					qty: quantity,
					direction: "buy"
				}, function(err, newOrder) {
					if (err) {
						throw err
					} else {
						console.log("Placed buy order (" + newOrder.id + ") for", buyPrice);
						openOrders.push(newOrder.id)
					}
				})
			}
			// if position > -500, place sell order
			if (position > 500) {
				tradebot.venue(game.venues[0]).stock(game.tickers[0]).order({
					account: game.account,
					price: sellPrice,
					qty: quantity,
					direction: "sell"
				}, function(err, newOrder) {
					if (err) {
						throw err
					} else {
						console.log("Placed sell order (" + newOrder.id + ") for", sellPrice);
						openOrders.push(newOrder.id)
					}
				})
			}
		})
		console.log("Position:", position);
		console.log("Open orders:", openOrders.length);
	}, 5000)

	var cancelOrder = (orderID) => {
		// cancel order, and adjust position with totalFilled
		tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(orderID).cancel((err, canceledOrder) => {
			if (err) {
				throw err
			}
			// adjust position based on direction and quantity filled
			console.log("Current position:", position);
			if (canceledOrder.direction == "buy") {
				position += canceledOrder.totalFilled
				console.log("Closed buy order (" + canceledOrder.id + ") for qty", canceledOrder.totalFilled);
			} else if (canceledOrder.direction == "sell") {
				position -= canceledOrder.totalFilled
				console.log("Closed sell order (" + canceledOrder.id + ") for qty", canceledOrder.totalFilled);
			}
			console.log("New position:", position);
		})
	}
})
