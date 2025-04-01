#!/bin/bash

# Run the predicate tree POJO import/export example
echo "Running Example..."
npx ts-node ./index.ts 2>&1 | tee ./debug.run.log

echo "Done!" 