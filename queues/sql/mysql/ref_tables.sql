with recursive ref_tables_cte as (
    select tbl.table_name
         , tbl.table_schema             as schema_name
         , rc.referenced_table_name     as ref_table
         , rc.unique_constraint_schema  as ref_schema
         , case when rc.referenced_table_name is null
                then 99
                else 1
            end                                        as ref_depth
      from information_schema.tables tbl
      left outer join information_schema.referential_constraints rc
                   on rc.table_name               = tbl.table_name
                  and rc.constraint_schema        = tbl.table_schema
     where tbl.table_type    = 'BASE TABLE'
       and tbl.table_schema in (?)
    union all
    select rtc.ref_table
         , rtc.ref_schema
         , rc.referenced_table_name
         , rc.unique_constraint_schema
         , case when rc.referenced_table_name is null
                then 99
                else rtc.ref_depth + 1
            end
      from ref_tables_cte   rtc
      left outer join information_schema.referential_constraints rc
                   on rc.table_name               = rtc.ref_table
                  and rc.constraint_schema        = rtc.ref_schema
                  and (   rc.referenced_table_name      != rc.table_name
                       or rc.unique_constraint_schema   != rc.constraint_schema)
     where rtc.ref_table is not null
)
  select table_name
       , schema_name
       , max(ref_depth) ref_depth
    from ref_tables_cte
group by table_name
       , schema_name
order by 3 desc;
