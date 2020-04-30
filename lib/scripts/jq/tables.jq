def clean_keys:
  . | ascii_downcase
    | sub("column_";"");

def clean_array:
  map(. | with_entries( .key |= clean_keys));

.columns |= clean_array
| .key |= clean_array
