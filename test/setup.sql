drop database if exists exp_data;
drop database if exists exp_dep;

create database exp_dep;
use exp_dep;
create table dep_lookup
(
  id        smallint auto_increment primary key,
  code      char(15) not null,
  descr     varchar(50) not null
);

create unique index dep_lookup_uk on dep_lookup(code);

create database exp_data;
use exp_data;

create table no_fk_data
(
  id        smallint auto_increment primary key,
  code      char(15) not null,
  descr     varchar(50) not null
);

create unique index no_fk_data_uk on no_fk_data(code);

create table has_fk_data
(
  id        smallint auto_increment primary key,
  code      char(15) not null,
  descr     varchar(50) not null,
  lookup_id smallint
);

alter table has_fk_data
add foreign key lookup_id_fk(lookup_id)
references exp_dep.dep_lookup(id);

create unique index has_fk_data_uk on has_fk_data(code);

create table self_fk_data
(
  id          smallint auto_increment primary key,
  code        char(15) not null,
  descr       varchar(50) not null,
  self_ref_id smallint
);

alter table self_fk_data
add foreign key self_fk_data_fk(self_ref_id)
references self_fk_data(id);

create unique index self_fk_data_uk on self_fk_data(code);

create table l2_fk_data
(
  id        smallint auto_increment primary key,
  code      char(15) not null,
  descr     varchar(50) not null,
  lookup_id smallint
);

alter table l2_fk_data
add foreign key l2_fk_data_fk(lookup_id)
references has_fk_data(id);
