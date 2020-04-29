select table_schema
     , table_name
  from information_schema.tables
 where table_schema = 'sample';

 ('sample','sca_production')
