select table_schema as "schema"
     , table_name   as "table"
  from information_schema.tables
 where table_schema = ?
