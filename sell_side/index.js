var Stockfighter = require('../api/stockfighter.js')
var leftPad = require('left-pad');

var tradebot = Stockfighter({
	api_key: "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
})

if (process.argv[2]) {
	position = parseInt(process.argv[2])
} else {
	position = 0 // number of shares in either direction
}

if (process.argv[3]) {
	cash = parseInt(process.argv[3])
} else {
	cash = 0
}



openOrders = []
percentSpread = .05 // percentage of last trade price
quantity = 100

positionCompensation = .1

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
			spread = (quote.last * percentSpread) / 2
			if (position > 0) {
				// if position is positive, jack down buy price
				buyPrice = Math.round(quote.last - spread - (spread * Math.abs(position) * positionCompensation))
				sellPrice = Math.round(quote.last + spread)
			} else if (position < 0) {
				// if position is negative, jack up sell price
				buyPrice = Math.round(quote.last - spread)
				sellPrice = Math.round(quote.last + spread + (spread * Math.abs(position) * positionCompensation))
			} else {
				buyPrice = Math.round(quote.last - spread)
				sellPrice = Math.round(quote.last + spread)
			}

			// if buy price is < 0, set equal to 0.01
			if (buyPrice < 0) {
				buyPrice = 1
			}
			console.log(buyPrice, lastPrice, sellPrice);
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
						// console.log("Placed buy order (" + newOrder.id + ") for", buyPrice);
						openOrders.push(newOrder.id)
					}
				})
			}
			// if position > -500, place sell order
			if (position > -500) {
				tradebot.venue(game.venues[0]).stock(game.tickers[0]).order({
					account: game.account,
					price: sellPrice,
					qty: quantity,
					direction: "sell"
				}, function(err, newOrder) {
					if (err) {
						throw err
					} else {
						// console.log("Placed sell order (" + newOrder.id + ") for", sellPrice);
						openOrders.push(newOrder.id)
					}
				})
			}
		})
		console.log("Position:", leftPad(position, 6), " | ", "Cash:", leftPad((cash / 100.0), 10));
	}, 5000)

	var cancelOrder = (orderID) => {
		// cancel order, and adjust position with totalFilled
		tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(orderID).cancel((err, canceledOrder) => {
			if (err) {
				throw err
			}
			// adjust position based on direction and quantity filled
			if (canceledOrder.direction == "buy") {
				for (fill of canceledOrder.fills) {
					cash -= fill.price * fill.qty
				}
				position += canceledOrder.totalFilled
			} else if (canceledOrder.direction == "sell") {
				for (fill of canceledOrder.fills) {
					cash += fill.price * fill.qty
				}
				position -= canceledOrder.totalFilled
			}
		})
	}
})
