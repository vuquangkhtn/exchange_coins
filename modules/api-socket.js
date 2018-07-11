let dbHelper = require('../helpers/db-helper');
let BLT = require('../helpers/bitcoin-live-transactions');
let Client = require('bitcore-wallet-client');

// let BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';
let ACCEPTED_CONFIRM_AMOUNT = 2;

function removeUnconfirmTran(tranId) {
    dbHelper.dbLoadSql(
        `DELETE FROM tb_unconfirm_trans
        WHERE tran_id = ?`,
        [
            tranId
        ]
    ).then(function (unconfirmTrans) {
        if(unconfirmTrans.affectedRows > 0) {
            console.log("deleted " + tranId);
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function checkForConfirm() {
    dbHelper.dbLoadSql(
        `SELECT * 
        FROM tb_unconfirm_trans t`
    ).then(
        function (unconfirmTransList) {
            if (unconfirmTransList.length > 0) {
                var client = new Client({
                    baseUrl: BWS_INSTANCE_URL,
                    verbose: false,
                });
                client.import('{"coin":"btc","network":"testnet","xPrivKey":"tprv8ZgxMBicQKsPdqwY2cftLmsbZ2XqdPcCXHkyz52RZ4aisgM3JPWnXD8XyLh1zQ8Yskw9Gn5HRVWigNwgNpG5LLsrUw9XLApUKB2H8ZRfYrw","xPubKey":"tpubDD7gpiZfP9pFmhaQgFLK531nvsbmKu93e6fVKX4qwZ3fErv8xQaRNUjt2BkvdWd1yWCDgyaAA75eV6YSYheG4c8d8BB77v3HYS5v9T6feD8","requestPrivKey":"2210c602b62ddfa269802e91f33282d496d4696e210d5e79510f5af9d823542e","requestPubKey":"025b1020d9a61a450873b44b03b6f0759d23b8351de25e832f185fa1bbd7dac71e","copayerId":"1b70ab70b7ea49c998d8e293dbca0b57afb094c7a5bf5d7836810a324ba6d99e","publicKeyRing":[{"xPubKey":"tpubDD7gpiZfP9pFmhaQgFLK531nvsbmKu93e6fVKX4qwZ3fErv8xQaRNUjt2BkvdWd1yWCDgyaAA75eV6YSYheG4c8d8BB77v3HYS5v9T6feD8","requestPubKey":"025b1020d9a61a450873b44b03b6f0759d23b8351de25e832f185fa1bbd7dac71e"}],"walletId":"183cd091-3fd9-4e89-9fd6-4ba946ef7642","walletName":"My Wallet","m":1,"n":1,"walletPrivKey":"b931f091cdc6df1d5011d0167300b642b2292d999299afd301cf0756c857a147","personalEncryptingKey":"6gbVlVczsCg/AKqbYlC0kw==","sharedEncryptingKey":"izCQrBj8iqP2klrzilZCHg==","copayerName":"Irene","entropySource":"3263917ac0260645f5dd5e15bade7504cf1db2c853d81dc435bd0961a6bc2aa3","derivationStrategy":"BIP44","account":0,"compliantDerivation":true,"addressType":"P2PKH"}');
                // let opts = {
                //     limit: 100
                //   };
                client.getTxHistory({}, function(err, tx) {
                    if (err) {
                      console.log('error: ', err);
                      return;
                    };
                    unconfirmTransList.forEach(txp => {
                        tx.forEach(t => {
                            if (txp['tran_id'] != null 
                                && t.txid == txp['tran_id']
                                && t.confirmations >= ACCEPTED_CONFIRM_AMOUNT) {
                                //send api request exchange coin here
                                let checkSuccess = true;
                                if(checkSuccess) {
                                    removeUnconfirmTran(t.txid);
                                }
                            }
                        });
                    });
                })     
            }
        }
    ).catch(function (error) {
        console.log(error);
    });
}

setInterval(checkForConfirm, 5000);