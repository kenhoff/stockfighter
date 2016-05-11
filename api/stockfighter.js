var request = require('request');

module.exports = function(opts) {
	for (var opt in opts) {
		if (opts.hasOwnProperty(opt)) {
			this[opt] = opts[opt]
		}
	}
	return {
		heartbeat: function(cb) {
			request({
				method: "GET",
				url: "https://api.stockfighter.io/ob/api/heartbeat"
			}, function(err, response, body) {
				cb(err, JSON.parse(body))
			})
		},
		venue: (venue_id) => {
			// if there's no cb, just get the list of stocks
			return {
				heartbeat: function(cb) {
					request({
						method: "GET",
						url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/heartbeat"
					}, function(err, response, body) {
						cb(err, JSON.parse(body))
					})
				},
				stocks: function(cb) {
					request({
						method: "GET",
						url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/stocks"
					}, function(err, response, body) {
						cb(err, JSON.parse(body))
					})
				},
				stock: (stock_id, cb) => {
					if (cb) {
						request({
							method: "GET",
							url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/stocks/" + stock_id
						}, function(err, response, body) {
							cb(err, JSON.parse(body))
						})
					} else {
						return {
							quote: function(cb) {
								request({
									method: "GET",
									url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/stocks/" + stock_id + "/quote"
								}, function(err, response, body) {
									cb(err, JSON.parse(body))
								})
							},
							orderbook: function(cb) {
								request({
									method: "GET",
									url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/stocks/" + stock_id
								}, function(err, response, body) {
									cb(err, JSON.parse(body))
								})
							},
							order: (arg, cb) => {
								if (typeof arg == "number") {
									order_id = arg
									getOrder({
										api_key,
										venue_id,
										stock_id,
										order_id
									}, function(err, result) {
										cb(err, result)
									})
								} else if (typeof arg == "object") {
									order_opts = Object.assign({}, {
										api_key,
										venue_id,
										stock_id
									}, arg)
									placeOrder(order_opts, function(err, result) {
										cb(err, result)
									})
								}
							}
						}
					}
				}
			}
		}
	}
}

getOrder = function(opts, cb) {
	request({
		method: "GET",
		url: "https://api.stockfighter.io/ob/api/venues/" + opts.venue_id + "/stocks/" + opts.stock_id + "/orders/" + opts.order_id,
		headers: {
			"X-Starfighter-Authorization": opts.api_key,
		}
	}, function(err, response, body) {
		cb(err, JSON.parse(body))
	})
}

placeOrder = function(opts, cb) {
	request({
		method: "POST",
		url: "https://api.stockfighter.io/ob/api/venues/" + opts.venue_id + "/stocks/" + opts.stock_id + "/orders",
		body: {
			account: opts.account_id,
			venue: opts.venue_id,
			stock: opts.stock_id,
			price: opts.price,
			qty: opts.qty,
			direction: opts.direction,
			orderType: opts.order_type
		},
		json: true,
		headers: {
			"X-Starfighter-Authorization": api_key,
		}
	}, function(err, response, body) {
		cb(err, body)
	})
}
