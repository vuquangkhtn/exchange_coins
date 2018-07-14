let dbHelper = require('../helpers/db-helper');
let Client = require('bitcore-wallet-client');

var ethers = require('ethers');
var Wallet = ethers.Wallet;

// var BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';
let NETWORK = 'testnet';

exports.register = function (req, res) {
  let params = req.body || {};

  let client = new Client({
    baseUrl: BWS_INSTANCE_URL,
    verbose: false,
  });
  client.createWallet("My Wallet", "Irene", 1, 1, {network: NETWORK}, function(err, secret) {
    if (err) {
      let data = {
        'status': '500',
        'data': {
          'error': err
        }
      };
      res.send(data);
      return;
    };
    
    let walletStr = client.export();
    if (walletStr != null) {
      client.createAddress({}, function(err,addr){
        if (err) {
          console.log('error: ', err);
          let data = {
            'status': '500',
            'data': {
              'error': "register failed"
            }
          };
          res.send(data);
          return;
        };

        console.log('BTC Addr:', addr);
        var wallet = Wallet.createRandom();
        if(wallet == undefined || wallet == null) {
          console.log('error: ', err);
          let data = {
            'status': '500',
            'data': {
              'error': "register failed"
            }
          };
          res.send(data);
          return;
        }
        console.log("ETH Address: " + wallet.address);
        dbHelper.dbLoadSql(
          `INSERT INTO tb_user (btc_encrypted,eth_key)
          VALUES (?,?)`,
          [
            walletStr,
            wallet.privateKey
          ]
        ).then(
          function (userInfo) {
            if (userInfo.insertId > 0) {
              let data = {
                'status': '200',
                'data': {
                  'uin':userInfo.insertId,
                  'report': 'signup successful!'
                }
              };
              res.send(data);
            } else {
              let data = {
                'status': '500',
                'data': {
                  'error': 'signup failed!'
                }
              };
              res.send(data);
            }
          }
        ).catch(function (error) {
          let data = {
            'status': '500',
            'data': {
              'error': 'signup failed!'
            }
          };
          console.log(error);
          res.send(data);
          }
        );
      });
    } else {
      let data = {
        'status': '500',
        'data': {
          'error': 'signup failed!'
        }
      };
      res.send(data);
    }
  });
  
};