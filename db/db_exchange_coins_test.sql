-- host: 'sql12.freemysqlhosting.net',
-- user: 'sql12240801',
-- password: 'jAXV6cJ51V',
-- database: 'sql12240801',
-- Port number: 3306

create database db_exchange_coins;
use db_exchange_coins;

create table tb_user(
	user_id int auto_increment key,
    btc_encrypted text,
    eth_key text
)

create table tb_unconfirm_trans(
	id int auto_increment key,
    tran_id text
)


-- INSERT INTO tb_user (btc_encrypted,eth_key) VALUES ('{"coin":"btc","network":"testnet","xPrivKey":"tprv8ZgxMBicQKsPfNKjUaiXd7dRkEyAE7xjeDkHxzPvSbC2hRjnxvSVfRozFHaK7G7odGYFmM8M7TZftmgezkhcQCZ4kzoJnsZkSpxhWAD8WYq","xPubKey":"tpubDCPXUrN6XG5RjDBMUB1TyzWvLB8BqeEihLgMhLpZygTjZcDJ6SYTtJC7qs7MHUdDU3xwuDAmNyW9CAb4FUAuRNBJMGthouPEPKTKxrNEQQj","requestPrivKey":"5095cc50524e2ba42a01cee576a8ab98895a8c9873f95e5df19fe934da32ed4b","requestPubKey":"036d08f217f359c0666738e432112df246739df001287b3a5779c4c6a9e35a3c61","copayerId":"e9045a593ddaec4775ae2e8a41ec4fcf9d2d65880100ea9bf63879615bd00232","publicKeyRing":[{"xPubKey":"tpubDCPXUrN6XG5RjDBMUB1TyzWvLB8BqeEihLgMhLpZygTjZcDJ6SYTtJC7qs7MHUdDU3xwuDAmNyW9CAb4FUAuRNBJMGthouPEPKTKxrNEQQj","requestPubKey":"036d08f217f359c0666738e432112df246739df001287b3a5779c4c6a9e35a3c61"}],"walletId":"6dd1af07-3e83-460f-9b65-e17cb137bece","walletName":"My Wallet 2","m":1,"n":1,"walletPrivKey":"01c4a35f7946c141d2fca2166d2e7a19dda2ba62dd46c5bf7875e1727a233354","personalEncryptingKey":"Xywi0CFGCFhMfuwKZdsetw==","sharedEncryptingKey":"ZzmIIv/+puWgXcvco/BzkA==","copayerName":"Tomas","entropySource":"91f48f7b269cd64e03c70a89a7924b61474b8ba129b4685d9c159cdb5b8d63f2","derivationStrategy":"BIP44","account":0,"compliantDerivation":true,"addressType":"P2PKH"}','0x29ea8ec0c0f532b96e7391716aecb0a7e3d92bc74da42d2b105fbf33f7197d7f')