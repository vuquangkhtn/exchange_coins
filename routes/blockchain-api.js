let express = require('express');
let coreApiRoute = express.Router();

let apiRegister = require('../modules/api-register');

// Api register
coreApiRoute.post('/register', function (req, res) {
  apiRegister.register(req, res);
});



module.exports = coreApiRoute;