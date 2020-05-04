  select rc.constraint_schema          as table_schema
       , rc.table_name
       , rc.constraint_name           as table_constraint
       , rc.unique_constraint_schema  as ref_schema
       , rc.referenced_table_name     as ref_table
       , json_arrayagg(
           cast(
             concat(
                '{"name":"'
              , kcu.column_name
              , '","position":'
              , kcu.ordinal_position
              ,'}'
             ) as JSON
           )
         )                            as columns
       , case when rc.delete_rule = 'NO ACTION'
              then null
              else rc.delete_rule
          end                        as delete_rule
       , case when rc.update_rule = 'NO ACTION'
              then null
              else rc.update_rule
          end                        as update_rule
   from information_schema.referential_constraints rc
  inner join information_schema.key_column_usage  kcu
     on (    kcu.constraint_name   = rc.constraint_name
         and kcu.constraint_schema = rc.constraint_schema)
  where rc.constraint_schema     = ?
    and rc.table_name            = ?
group by rc.constraint_schema
       , rc.table_name
       , rc.constraint_name
       , rc.unique_constraint_schema
       , rc.referenced_table_name
       , rc.delete_rule
       , rc.update_rule;
