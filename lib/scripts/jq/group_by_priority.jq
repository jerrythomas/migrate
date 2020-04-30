def priority_group:
  map(.
  | {
       depth:.[0].ref_depth,
       group: map(.
                  | del(.ref_depth)
                  | with_entries(.key |= sub("_name";""))
                  + {object:"table"}
                 )
     }
  )
  | sort_by(-.depth)
  | to_entries
  | map(.|{priority: .key, tables: .value.group});

{
  schema: {object: "schema", names: map(.schema_name) | unique},
  groups: group_by(.ref_depth) | priority_group
}
