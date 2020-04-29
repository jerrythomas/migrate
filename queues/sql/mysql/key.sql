  select ordinal_position  column_position
       , column_name
    from information_schema.key_column_usage
   where constraint_name = 'PRIMARY'
     and table_schema = ?
     and table_name   = ?
order by ordinal_position;
