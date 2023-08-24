#!/bin/bash

# Run the pacman command and store the output in a variable
pacman_output=$(pacman -Qent)

# Extract package names using awk
package_names=$(echo "$pacman_output" | awk '{print $1}')

# Run the expac command to get package installation date and sort by date
sorted_packages=$(expac --timefmt='%Y-%m-%d %T' '%l\t%n' | sort)

# Loop through sorted packages and check if they are in the array

filtered_packages=""
while read -r line; do
    date=$(echo "$line" | cut -f1)
    name=$(echo "$line" | cut -f2)
    if [[ $package_names == *"$name"* ]]; then
        filtered_packages="$filtered_packages$date\t$name\n"
    fi
done <<< "$sorted_packages"

# Print the filtered package names
echo -e "$sorted_packages"
