   select concat('select '
                , group_concat(case when lower(data_type) = 'geometry'
                                    then concat('ST_AsText(', column_name,') as ', column_name)
                                    else column_name
                                end
                              order by ordinal_position separator ', ')
                , ' from '
                , table_schema
                , '.'
                , table_name
                ,';')  as 'script'
    from information_schema.columns
   where table_name   = ?
     and table_name   = ?
group by table_schema
       , table_name;
