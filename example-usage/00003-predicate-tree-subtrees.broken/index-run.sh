#!/bin/bash
clear
# Pass all arguments from this script to the TypeScript script
npx ts-node index.ts "$@" 2>&1 | tee debug.run.log

# If no arguments were passed, let the user know what's running
if [ $# -eq 0 ]; then
  echo -e "\nNo arguments provided. Running the NOT subtree example by default."
  echo -e "Run with --help to see all available options."
fi
