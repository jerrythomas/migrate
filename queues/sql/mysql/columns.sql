  select column_name
       , data_type
       , case when data_type in ('char', 'varchar')
              then character_maximum_length
              when data_type in ('decimal', 'numeric')
              then numeric_precision
              else null
          end                       as column_precision
       , numeric_scale              as column_scale
       , column_default
       , ordinal_position           as position
       , is_nullable
       , column_key                 as key_type
       , column_comment
       , extra
       , generation_expression      as generator
    from information_schema.columns
   where table_schema = ?
     and table_name   = ?
order by ordinal_position;
