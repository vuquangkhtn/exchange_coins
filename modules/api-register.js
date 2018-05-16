let dbHelper = require('../helpers/db-helper');
let utils = require('../helpers/utils.js');

exports.register = function (req, res) {
  let params = req.body || {};

  let walletStr = utils.createWallet("New Wallet","Irene");

  if(data != '') {
    dbHelper.dbLoadSql(
      `INSERT INTO tb_user (data)
      VALUES (?)`,
      [
        walletStr
      ]
    ).then(
      function (userInfo) {
        if (userInfo[0]['userid'] > 0) {
          let data = {
            'status': '200',
            'data': {
              'uin':userInfo[0]['userid'],
              'report': 'Đăng nhập thành công!'
            }
          };
          res.send(data);
        } else {
          let data = {
            'status': '500',
            'data': {
              'error': 'Đăng nhập thất bại!'
            }
          };
          res.send(data);
        }
      }
    ).catch(function (error) {
        res.send(error);
      }
    );
  }
  
};