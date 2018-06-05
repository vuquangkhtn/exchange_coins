let dbHelper = require('../helpers/db-helper');
let Client = require('bitcore-wallet-client');

// var BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';

let receiverAddr = 'mq9xCdcUQZPsLEi8xFeNVXEMS43q5aMvRq';

let coinType = {
    btc: "BTC",
    eth: "ETH"
}
exports.coinToXu = function (req, res) {
    let params = req.body || {};
    let userId = params['user_id'] || '';
    let type_coin = params['type_coin'].toUpperCase() || '';
    let valueExchange = params['coin_value'] || '';

    if (userId == '' || type_coin == '' || valueExchange == '') {
        let data = {
          'status': '500',
          'data': {
            'error': 'input failed!'
          }
        };
        res.send(data);
    } else {
        let xuAmount;
        xuAmount = valueExchange * 10000;
        satoshiAmount = valueExchange * 100000000;

        if(type_coin == coinType.btc) {
            dbHelper.dbLoadSql(
                `SELECT data 
                FROM tb_user u
                WHERE u.userid = ?`,
                [
                userId
                ]
            ).then(
                function (userInfo) {
                    if (userInfo[0]['data'] != null) {
                        var client = new Client({
                            baseUrl: BWS_INSTANCE_URL,
                            verbose: false,
                        });
                        client.import(userInfo[0]['data']);
                        client.getBalance({}, function(err, bl) {
                            if (err) {
                                console.log('error: ', err);
                                let data = {
                                    'status': '500',
                                    'data': {
                                        'error': err.message
                                    }
                                };
                                res.send(data);
                                return;
                            };
                            //from addr
                            client.getMainAddresses({
                                doNotVerify: true
                            }, function(err, addr) {
                                if (err) {
                                    console.log('error: ', err);
                                    let data = {
                                        'status': '500',
                                        'data': {
                                            'error': err.message
                                        }
                                    };
                                    res.send(data);
                                    return;
                                };
                                
                                client.getFeeLevels('btc', 'testnet', function(err, levels) {
                                    // console.log(levels);
                                    if (err) {
                                        console.log('errorFee: ', err);
                                        let data = {
                                            'status': '500',
                                            'data': {
                                                'error': err
                                            }
                                        };
                                        res.send(data);
                                        return;
                                    };
                
                                    var optsCreate = {
                                        outputs: [{
                                            toAddress: receiverAddr,
                                            amount: satoshiAmount
                                            // amount: bl.availableConfirmedAmount - levels[0].feePerKb
                                        }],
                                        changeAddress: addr[0].address,
                                        feePerKb: levels[0].feePerKb,
                                        excludeUnconfirmedUtxos: true
                                    };
                                    client.createTxProposal(optsCreate, function(err, createTxp) {
                                        if (err) {
                                            console.log('error: ', err);
                                            let data = {
                                                'status': '500',
                                                'data': {
                                                    'error': err.message
                                                }
                                            };
                                            res.send(data);
                                            return;
                                        };
    
                                        //publish tx
                                        client.publishTxProposal({
                                            txp: createTxp
                                        }, function(err, publishTxp) {
                                            if (err) {
                                                console.log('error: ', err);
                                                let data = {
                                                    'status': '500',
                                                    'data': {
                                                        'error': err.message
                                                    }
                                                };
                                                res.send(data);
                                                return;
                                            };
                                            
                                            client.signTxProposal(publishTxp, function(err, signTxp) {
                                                if (err) {
                                                    console.log('error: ', err);
                                                    let data = {
                                                        'status': '500',
                                                        'data': {
                                                            'error': err.message
                                                        }
                                                    };
                                                    res.send(data);
                                                    return;
                                                };
                                                if (signTxp.status != 'accepted') {
                                                    let data = {
                                                        'status': '500',
                                                        'data': {
                                                            'error': 'signtxp status is not accepted'
                                                        }
                                                    };
                                                    res.send(data);
                                                    return;
                                                };
                                                
                                                //broadcast success
                                                client.broadcastTxProposal(signTxp, function(err, zz, memo) {
                                                    if (err) {
                                                        console.log('error: ', err);
                                                        let data = {
                                                            'status': '500',
                                                            'data': {
                                                                'error': err.message
                                                            }
                                                        };
                                                        res.send(data);
                                                        return;
                                                    };
                                                    
                                                    //Success send tx
                                                    let data = {
                                                        'status': '200',
                                                        'data': {
                                                            'value': xuAmount,
                                                            'report': 'exchange successful!'
                                                        }
                                                    };
                                                    res.send(data);  
                                                    return;                                                                  
                                                });
                                            });
                                        });
                                    });
                                    
                                });
                            }); 
                        });
                    } else {
                        let data = {
                            'status': '500',
                            'data': {
                            'error': 'get user info failed!'
                            }
                        };
                        res.send(data);
                        return;
                    }
                }
            ).catch(function (error) {
                let data = {
                    'status': '500',
                    'data': {
                        'error': 'exchange failed!'
                    }
                };
                console.log(error);
                res.send(data);
            });
        } else if (type_coin == coinType.eth){
            let data = {
                'status': '200',
                'data': {
                    'report': 'eth is not ready!'
                }
            };
            res.send(data);
        } else {
            let data = {
                'status': '500',
                'data': {
                    'error': 'type coin is wrong!'
                }
            };
            res.send(data);
        }

        
    }
};

exports.xuToCoin = function (req, res) {
    let params = req.body || {};
    let userId = params['user_id'] || '';
    let type_coin = params['type_coin'].toUpperCase() || '';
    let valueExchange = params['xu_value'] || '';

    if (userId == '' || type_coin == '' || valueExchange == '') {
        let data = {
          'status': '500',
          'data': {
            'error': 'input failed!'
          }
        };
        res.send(data);
    } else {
        let xuAmount;
        xuAmount = valueExchange;
        satoshiAmount = xuAmount * 10000;

        if(type_coin == coinType.btc) {
            dbHelper.dbLoadSql(
                `SELECT data 
                FROM tb_user u
                WHERE u.userid = ?`,
                [
                userId
                ]
            ).then(
                function (userInfo) {
                    if (userInfo[0]['data'] != null) {
                        var client = new Client({
                            baseUrl: BWS_INSTANCE_URL,
                            verbose: false,
                        });
                        var client2 = new Client({
                            baseUrl: BWS_INSTANCE_URL,
                            verbose: false,
                        });
                        client.import('{"coin":"btc","network":"testnet","xPrivKey":"tprv8ZgxMBicQKsPdqwY2cftLmsbZ2XqdPcCXHkyz52RZ4aisgM3JPWnXD8XyLh1zQ8Yskw9Gn5HRVWigNwgNpG5LLsrUw9XLApUKB2H8ZRfYrw","xPubKey":"tpubDD7gpiZfP9pFmhaQgFLK531nvsbmKu93e6fVKX4qwZ3fErv8xQaRNUjt2BkvdWd1yWCDgyaAA75eV6YSYheG4c8d8BB77v3HYS5v9T6feD8","requestPrivKey":"2210c602b62ddfa269802e91f33282d496d4696e210d5e79510f5af9d823542e","requestPubKey":"025b1020d9a61a450873b44b03b6f0759d23b8351de25e832f185fa1bbd7dac71e","copayerId":"1b70ab70b7ea49c998d8e293dbca0b57afb094c7a5bf5d7836810a324ba6d99e","publicKeyRing":[{"xPubKey":"tpubDD7gpiZfP9pFmhaQgFLK531nvsbmKu93e6fVKX4qwZ3fErv8xQaRNUjt2BkvdWd1yWCDgyaAA75eV6YSYheG4c8d8BB77v3HYS5v9T6feD8","requestPubKey":"025b1020d9a61a450873b44b03b6f0759d23b8351de25e832f185fa1bbd7dac71e"}],"walletId":"183cd091-3fd9-4e89-9fd6-4ba946ef7642","walletName":"My Wallet","m":1,"n":1,"walletPrivKey":"b931f091cdc6df1d5011d0167300b642b2292d999299afd301cf0756c857a147","personalEncryptingKey":"6gbVlVczsCg/AKqbYlC0kw==","sharedEncryptingKey":"izCQrBj8iqP2klrzilZCHg==","copayerName":"Irene","entropySource":"3263917ac0260645f5dd5e15bade7504cf1db2c853d81dc435bd0961a6bc2aa3","derivationStrategy":"BIP44","account":0,"compliantDerivation":true,"addressType":"P2PKH"}');
                        client2.import(userInfo[0]['data']);
                        client.getBalance({}, function(err, bl) {
                            if (err) {
                                console.log('error: ', err);
                                let data = {
                                    'status': '500',
                                    'data': {
                                        'error': err.message
                                    }
                                };
                                res.send(data);
                                return;
                            };
                            //from addr
                            client.getMainAddresses({
                                doNotVerify: true
                            }, function(err, addr) {
                                if (err) {
                                    console.log('error: ', err);
                                    let data = {
                                        'status': '500',
                                        'data': {
                                            'error': err.message
                                        }
                                    };
                                    res.send(data);
                                    return;
                                };
                                
                                client.getFeeLevels('btc', 'testnet', function(err, levels) {
                                    // console.log(levels);
                                    if (err) {
                                        console.log('errorFee: ', err);
                                        let data = {
                                            'status': '500',
                                            'data': {
                                                'error': err
                                            }
                                        };
                                        res.send(data);
                                        return;
                                    };

                                    client2.getMainAddresses({
                                        doNotVerify: true
                                      }, function(err, addr2) {
                                        if (err) {
                                            console.log('error: ', err);
                                            let data = {
                                                'status': '500',
                                                'data': {
                                                    'error': err
                                                }
                                            };
                                            res.send(data);
                                            return;
                                        };
                                        var optsCreate = {
                                            outputs: [{
                                                toAddress: addr2[0].address,
                                                amount: satoshiAmount
                                                // amount: bl.availableConfirmedAmount - levels[0].feePerKb
                                            }],
                                            changeAddress: addr[0].address,
                                            feePerKb: levels[0].feePerKb,
                                            excludeUnconfirmedUtxos: true
                                        };
                                        client.createTxProposal(optsCreate, function(err, createTxp) {
                                            if (err) {
                                                console.log('error: ', err);
                                                let data = {
                                                    'status': '500',
                                                    'data': {
                                                        'error': err.message
                                                    }
                                                };
                                                res.send(data);
                                                return;
                                            };
        
                                            //publish tx
                                            client.publishTxProposal({
                                                txp: createTxp
                                            }, function(err, publishTxp) {
                                                if (err) {
                                                    console.log('error: ', err);
                                                    let data = {
                                                        'status': '500',
                                                        'data': {
                                                            'error': err.message
                                                        }
                                                    };
                                                    res.send(data);
                                                    return;
                                                };
                                                
                                                client.signTxProposal(publishTxp, function(err, signTxp) {
                                                    if (err) {
                                                        console.log('error: ', err);
                                                        let data = {
                                                            'status': '500',
                                                            'data': {
                                                                'error': err.message
                                                            }
                                                        };
                                                        res.send(data);
                                                        return;
                                                    };
                                                    if (signTxp.status != 'accepted') {
                                                        let data = {
                                                            'status': '500',
                                                            'data': {
                                                                'error': 'signtxp status is not accepted'
                                                            }
                                                        };
                                                        res.send(data);
                                                        return;
                                                    };
                                                    
                                                    //broadcast success
                                                    client.broadcastTxProposal(signTxp, function(err, zz, memo) {
                                                        if (err) {
                                                            console.log('error: ', err);
                                                            let data = {
                                                                'status': '500',
                                                                'data': {
                                                                    'error': err.message
                                                                }
                                                            };
                                                            res.send(data);
                                                            return;
                                                        };
                                                        
                                                        //Success send tx
                                                        let data = {
                                                            'status': '200',
                                                            'data': {
                                                                'value': satoshiAmount/100000000,
                                                                'report': 'exchange successful!'
                                                            }
                                                        };
                                                        res.send(data);  
                                                        return;                                                                  
                                                    });
                                                });
                                            });
                                        });
                                    });  
                                });
                            }); 
                        });
                    } else {
                        let data = {
                            'status': '500',
                            'data': {
                            'error': 'get user info failed!'
                            }
                        };
                        res.send(data);
                        return;
                    }
                }
            ).catch(function (error) {
                let data = {
                    'status': '500',
                    'data': {
                        'error': 'exchange failed!'
                    }
                };
                console.log(error);
                res.send(data);
            });
        } else if (type_coin == coinType.eth){
            let data = {
                'status': '200',
                'data': {
                    'report': 'eth is not ready!'
                }
            };
            res.send(data);
        } else {
            let data = {
                'status': '500',
                'data': {
                    'error': 'type coin is wrong!'
                }
            };
            res.send(data);
        }        
    }
};