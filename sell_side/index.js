var Stockfighter = require('../api/stockfighter.js')

var tradebot = Stockfighter({
	api_key: "dbc9501eddfbaed304dbe2ce2d9ee6be901143c9"
})

open_orders = []
position = 0 // number of shares in either direction
position_acquire_price = 0 // how much we bought/sold our existing position for


// buy increases position
// sell decreases position
// shouldn't go above 1000 or below 1000

// tradebot.venue("GJBTEX").stock("SCL").order(2560, function(err, data) {
// 	console.log(data);
// })


// average position value is total position value / position

// every tick, look at the current quote for the stock
// if position is zero, just buy a share at ask price

// tradebot.venue("GPYBEX").stock("IWJE").quote(function(err, data) {
// 	console.log(data);
// })

tradebot.levels("sell_side").start(function(err, game) {
	// console.log(game);
	setInterval(() => {
		tradebot.venue(game.venues[0]).stock(game.tickers[0]).quote(function(err, data) {
				if (err) {
					throw err
				} else {
					// if position is greater than -1000, and bid price is greater than position_acquire_price, put in a sell order
					if (data.bid >= (position_acquire_price)) {
						order_opts = {
							account_id: game.account,
							price: data.bid,
							qty: Math.round(data.bidSize / 10),
							direction: "sell"
						}
						tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(order_opts, function(err, order) {
							if (err) {
								throw err
							} else {
								console.log("Put in a sell order for", order_opts.qty, "at", order_opts.price, "for a total of", order_opts.qty * order_opts.price);
								open_orders.push(order.id)
							}
						})
					}

					// if position is less than 1000, and ask price is less than position_acquire_price, put in a buy order
					if (data.ask <= (position_acquire_price)) {
						order_opts = {
							account_id: game.account,
							price: data.ask,
							qty: Math.round(data.askSize / 10),
							direction: "buy"
						}
						tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(order_opts, function(err, order) {
							if (err) {
								throw err
							} else {
								console.log("Put in a buy order for", order_opts.qty, "at", order_opts.price, "for a total of", order_opts.qty * order_opts.price);
								open_orders.push(order.id)
							}
						})
					}


					//  else {
					// 	if (data.ask && (data.ask != 0)) {
					// 		order_opts = {
					// 			account_id: game.account,
					// 			price: data.ask,
					// 			qty: 1,
					// 			direction: "buy"
					// 		}
					// 		tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(order_opts, function(err, order) {
					// 			if (err) {
					// 				throw err
					// 			} else {
					// 				// console.log(order);
					// 				open_orders.push(order.id)
					// 			}
					// 		})
					// 	}
					// }
				}
			})
			// every tick, look through my current (open) orders
			// if the order is filled:
			// 	add (if buy) or subtract (if sell) quantity filled
			// 	add (if buy) or subtract (if sell) total from total position value
			// 	remove the order ID from the open orders
		for (var i = open_orders.length - 1; i >= 0; i--) {
			// query tradebot to see if order got filled
			tradebot.venue(game.venues[0]).stock(game.tickers[0]).order(open_orders[i], function(err, order) {
				if (!order.open) {
					if (order.direction == "buy") {
						if (position >= 0) {
							position_acquire_price = ((position_acquire_price * position) + (order.price * order.originalQty)) / (position + order.originalQty)
						}
						position += order.originalQty
						console.log("Bought", order.originalQty, "at", order.price, "for a total of", order.originalQty * order.price);
					} else { // order direction sell
						if (position <= 0) {
							position_acquire_price = ((position_acquire_price * -position) + (order.price * order.originalQty)) / -(position - order.originalQty)
						}
						position -= order.originalQty
						console.log("Sold", order.originalQty, "at", order.price, "for a total of", order.originalQty * order.price);
					}

					if (position == 0) {
						position_acquire_price = 0
					}

					// console.log("Removing order", order.id, "at position", i);
					open_orders.splice(i, 1)
				}
			})
		}
		console.log("Position:", position);
		console.log("Position acquire price:", position_acquire_price);
		console.log("Open orders:", open_orders.length);
	}, 5000)
})
