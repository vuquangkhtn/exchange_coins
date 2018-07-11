-- Server: sql12.freemysqlhosting.net
-- Name: sql12240801
-- Username: sql12240801
-- Password: jAXV6cJ51V
-- Port number: 3306

create database db_exchange_coins;
use db_exchange_coins;
create table tb_user(
	userid int auto_increment key,
    data text
)

create table tb_unconfirm_trans(
	id int auto_increment key,
    tran_id text key
)