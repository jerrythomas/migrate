create table export_tables (
  session_id  varchar(64) not null,
  table_name  varchar(32) not null,
  schema_name varchar(32) not null,
  ref_table   varchar(32) not null,
  ref_schema  varchar(32) not null,
  ref_depth   int not null
);
