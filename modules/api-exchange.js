let dbHelper = require('../helpers/db-helper');
let Client = require('bitcore-wallet-client');

// var BWS_INSTANCE_URL = 'http://43.239.149.130:3232/bws/api';
let BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api';

let receiverAddr = 'mq9xCdcUQZPsLEi8xFeNVXEMS43q5aMvRq';

exports.coinToXu = function (req, res) {
    let params = req.body || {};
    let userId = params['user_id'] || '';
    let type_coin = params['type_coin'] || '';
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

        if(type_coin == 'btc') {
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
        } else if (type_coin == 'eth'){
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