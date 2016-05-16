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
								if (!cb) {
									// return object with place (not implemented yet) and cancel
									return {
										cancel: (cb) => {
											order = arg
											request({
												method: "DELETE",
												url: "https://api.stockfighter.io/ob/api/venues/" + venue_id + "/stocks/" + stock_id + "/orders/" + order,
												headers: {
													"X-Starfighter-Authorization": api_key,
												}
											}, function(err, response, body) {
												if (!JSON.parse(body).ok) {
													err = JSON.parse(body).error
												}
												cb(err, JSON.parse(body))
											})
										}
									}
								} else if (typeof arg == "number") {
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
										if (cb) {
											cb(err, result)
										}
									})
								}
							}
						}
					}
				}
			}
		},
		levels: (arg1) => {
			if (typeof arg1 == "function") {
				cb = arg1
				request({
					method: "GET",
					url: "https://www.stockfighter.io/gm/levels",
					headers: {
						"X-Starfighter-Authorization": api_key,
					}
				}, function(err, response, body) {
					cb(err, JSON.parse(body))
				})
			} else {
				return {
					start: (cb) => {
						request({
							method: "POST",
							url: "https://www.stockfighter.io/gm/levels/" + arg1,
							headers: {
								"X-Starfighter-Authorization": api_key,
							}
						}, function(err, response, body) {
							if (!JSON.parse(body).ok) {
								err = JSON.parse(body).error
							}
							cb(err, JSON.parse(body))
						})
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
		if (!JSON.parse(body).ok) {
			err = JSON.parse(body).error
		}
		cb(err, JSON.parse(body))
	})
}

placeOrder = function(opts, cb) {
	request({
		method: "POST",
		url: "https://api.stockfighter.io/ob/api/venues/" + opts.venue_id + "/stocks/" + opts.stock_id + "/orders",
		body: {
			account: opts.account,
			venue: opts.venue_id,
			stock: opts.stock_id,
			price: opts.price,
			qty: opts.qty,
			direction: opts.direction,
			orderType: opts.order_type || "limit"
		},
		json: true,
		headers: {
			"X-Starfighter-Authorization": api_key,
		}
	}, function(err, response, body) {
		if (!body.ok) {
			err = body.error
		}
		cb(err, body)
	})
}
