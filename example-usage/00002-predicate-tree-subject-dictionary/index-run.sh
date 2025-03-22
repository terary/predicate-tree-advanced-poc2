#!/bin/bash

# Pass all arguments from this script to the TypeScript script
npx ts-node index.ts "$@" 2>&1 | tee debug.run.log

# If no arguments were passed, show help by default
if [ $# -eq 0 ]; then
  echo -e "\nNo arguments provided. Run with --help to see usage options."
fi
