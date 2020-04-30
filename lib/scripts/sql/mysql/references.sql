select rc.constraint_schema as 'schema'
     , rc.table_name        as 'table'
     , rc.constraint_name   as 'constraint'
     , concat('alter table '
             , rc.constraint_schema
             , '.'
             , rc.table_name
             , ' add constraint '
             , rc.constraint_name
             , ' foreign key '
             , '('
             , group_concat(kcu.column_name order by kcu.ordinal_position separator ', ')
             , ') '
             , 'references '
             , rc.unique_constraint_schema
             , '.'
             , rc.referenced_table_name
             , '('
             , group_concat(kcu.referenced_column_name order by kcu.ordinal_position separator ', ')
             , ')'
             , case when rc.delete_rule = 'NO ACTION'
                    then ''
                    else concat(' on delete ', rc.delete_rule)
                end
             , case when rc.delete_rule = 'NO ACTION'
                    then ''
                    else concat(' on update ', rc.delete_rule)
                end
      )  as 'script'
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
