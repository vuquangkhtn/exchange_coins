let dbHelper = require('../helpers/db-helper');
let Client = require('bitcore-wallet-client');

// var BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';

let receiverAddr = 'mq9xCdcUQZPsLEi8xFeNVXEMS43q5aMvRq';

exports.btcToXu = function (req, res) {
    let params = req.body || {};
    let userId = params['user_id'] || '';
    let typeExchange = params['type_exchange'] || '';

    if (userId == '' || typeExchange == '') {
        let data = {
          'status': '500',
          'data': {
            'error': 'input failed!'
          }
        };
        res.send(data);
    } else {
        let btcAmount;
        let xuAmount;
        switch(typeExchange) {
            case '0': {
            btcAmount = 10000;
            xuAmount = 100;
            break;
            }
            case '1': {
            btcAmount = 100000;
            xuAmount = 1000;
            break;
            }
            case '2': {
            btcAmount = 1000000;
            xuAmount = 10000;
            break;
            }
            default: {
                let data = {
                    'status': '500',
                    'data': {
                    'error': 'type exchange failed!'
                    }
                };
                res.send(data);
            }
        }
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
                                        amount: btcAmount
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
    }
};