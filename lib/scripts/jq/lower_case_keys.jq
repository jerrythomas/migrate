map(. | with_entries( .key |= ascii_downcase ))
