let express = require('express');
let coreApiRoute = express.Router();

let apiRegister = require('../modules/api-register');
let apiExchange = require('../modules/api-exchange');

// Api register
coreApiRoute.post('/register', function (req, res) {
  apiRegister.register(req, res);
});

// Api exchange
coreApiRoute.post('/coin-to-xu', function (req, res) {
  apiExchange.coinToXu(req, res);
});

coreApiRoute.post('/xu-to-coin', function (req, res) {
  apiExchange.xuToCoin(req, res);
});

module.exports = coreApiRoute;