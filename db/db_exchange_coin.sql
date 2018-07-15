
-- host: 'sql12.freemysqlhosting.net',
-- user: 'sql12240801',
-- password: 'jAXV6cJ51V',
-- database: 'sql12240801',
-- Port number: 3306

create database db_exchange_coins;
use db_exchange_coins;

create table tb_user(
	user_id int auto_increment key,
    wallet_id int,
    
    CONSTRAINT fk_user_wallet
    FOREIGN KEY (wallet_id)
    REFERENCES tb_wallet (wallet_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

create table tb_wallet(
    wallet_id int auto_increment primary key,
    key_data text,
    type_id int,
    user_id int,

    CONSTRAINT fk_wallet_type
    FOREIGN KEY (type_id)
    REFERENCES tb_coin_type (type_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
    
    CONSTRAINT fk_wallet_user
    FOREIGN KEY (user_id)
    REFERENCES tb_user (user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

create table tb_coin_type(
    type_id int auto_increment primary key,
    type_name text
);

create table tb_unconfirm_trans(
	id int auto_increment key,
    tran_id text,
    type_id int,
    CONSTRAINT fk_unconfirm_type
    FOREIGN KEY (type_id)
    REFERENCES tb_coin_type (type_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

INSERT INTO tb_coin_type (type_name) VALUES ('BTC');
INSERT INTO tb_coin_type (type_name) VALUES ('ETH');