let dbHelper = require('../helpers/db-helper');
let BLT = require('../helpers/bitcoin-live-transactions');
let Client = require('bitcore-wallet-client');

// let BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';

let bitcoin = new BLT();
bitcoin.connect();
bitcoin.events.on('tx',function(tx){
    console.log('>> Transaction detected:', tx);
  })
// bitcoin.events.on('connected', function() {
//     let client = new Client({
//       baseUrl: BWS_INSTANCE_URL,
//       verbose: false,
//     });
//     client.getMainAddresses({
//         doNotVerify: true
//       }, function(err, addr) {
//         if (err) {
//           console.log('error: ', err);
//           return
//         };
//         // start listening to addresses 
//         bitcoin.events.on(addr[0].address,function(tx){
//             console.log('>> Transaction detected:', tx);
            
//             let data = JSON.parse(tx);
//           })
//       });
//  })