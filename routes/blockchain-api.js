let express = require('express');
let coreApiRoute = express.Router();

let apiRegister = require('../modules/api-register');
let apiExchange = require('../modules/api-exchange');

// Api register
coreApiRoute.post('/register', function (req, res) {
  apiRegister.register(req, res);
});

// Api exchange
coreApiRoute.post('/btc-to-xu', function (req, res) {
  apiExchange.btcToXu(req, res);
});


module.exports = coreApiRoute;