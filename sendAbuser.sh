#!/bin/bash

# Check if the remote host argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <remote_host>"
    exit 1
fi

remote_host=$1

# Clone the folder
cp -r abuser app-clone

# Remove node_modules
rm -rf app-clone/node_modules

# Send via scp
scp -r app-clone ubuntu@"$remote_host":~

# Clean up
rm -rf app-clone
