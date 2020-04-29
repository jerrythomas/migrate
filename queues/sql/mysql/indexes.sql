select index_name                        name
     , IF(non_unique, 'false', 'true')   uniqueness
     , json_arrayagg(
         cast(
           concat(
              '{"name":"'
            , column_name
            , '","position":'
            , SEQ_IN_INDEX
            ,'}'
           ) as JSON
         )
       )                                 columns
  from information_schema.statistics
 where table_schema = 'exp_data'
   and table_name   = 'self_fk_data'
   and index_name  != 'PRIMARY'
group by index_name
      , non_unique
