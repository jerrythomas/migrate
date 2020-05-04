create procedure get_tables(IN session_id varchar(64))
begin
  declare current_depth int default 1;
  declare rows_count int;

  insert into export_tables
  select es.session_id
       , tbl.table_name
       , tbl.table_schema             as schema_name
       , rc.referenced_table_name     as ref_table
       , rc.unique_constraint_schema  as ref_schema
       , case when rc.referenced_table_name is null
              then 99
              else 1
          end                                        as ref_depth
    from information_schema.tables tbl
   inner join export_session es
           on (es.schema_name = tbl.schema_name)
    left outer join information_schema.referential_constraints rc
                 on rc.table_name               = tbl.table_name
                and rc.constraint_schema        = tbl.table_schema
   where tbl.table_type    = 'BASE TABLE'
     and es.session_id = session_id;

   repeat
     insert into export_tables
     select rtc.session_id
          , rtc.ref_table
          , rtc.ref_schema
          , rc.referenced_table_name
          , rc.unique_constraint_schema
          , case when rc.referenced_table_name is null
                 then 99
                 else rtc.ref_depth + 1
             end
       from export_tables   rtc
       left outer join information_schema.referential_constraints rc
                    on rc.table_name               = rtc.ref_table
                   and rc.constraint_schema        = rtc.ref_schema
                   and (   rc.referenced_table_name      != rc.table_name
                        or rc.unique_constraint_schema   != rc.constraint_schema)
      where rtc.ref_table is not null
        and rtc.ref_depth = current_depth
        and rtc.session_id = session_id;

      set current_depth = current_depth + 1;
      select count(*)
        into rows_count
        from export_tables
       where ref_depth = current_depth;

   until rows_count = 0
   end repeat;

   select table_name
        , schema_name
        , max(ref_depth) ref_depth
     from export_tables
    where session_id = session_id
 group by table_name
        , schema_name
 order by 3 desc;
end
