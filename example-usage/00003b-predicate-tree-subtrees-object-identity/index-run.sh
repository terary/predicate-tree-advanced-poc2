#!/bin/bash

# Run the example
echo "Running Object Identity Predicate Tree Example..."
npx ts-node ./index.ts 2>&1 | tee ./debug.run.log

echo "Done!"
