create database oAuth2Test;

show databases;
use oAuth2Test;

create table users ( id int(16) not null auto_increment, username varchar(255), user_password varchar(255) ,primary key (id) );
create table access_tokens ( access_token varchar(255), user_id int(16) );
show tables;

describe users;
describe access_tokens;

