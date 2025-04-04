/**
 * Example: Predicate Tree Examples
 *
 * This example demonstrates three approaches to building predicate trees:
 * 1. With subject dictionary validation - ensures predicates conform to a defined schema
 * 2. Without subject dictionary validation - more flexible but less safe
 * 3. With multilingual labels - demonstrates how to create human-readable descriptions
 *
 * All examples show how to construct a predicate tree, but each has different features.
 */

import { runPredicateTreeValidationExample } from "./predicate-tree-validation";
import { runPredicateTreeWithoutDictionaryExample } from "./predicate-tree-non-subject-dictionary";
import { runLabelledPredicateTreeExample } from "./predicate-tree-label-subjectdictionary";

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp =
  args.includes("--help") || args.includes("-h") || args.length === 0;
const runValidated = args.includes("--validated") || args.includes("-v");
const runNonValidated = args.includes("--non-validated") || args.includes("-n");
const runLabelled = args.includes("--labelled") || args.includes("-l");
const runBoth = args.includes("--all") || args.includes("-a");

// Function to display help information
function showHelpMessage() {
  const helpText = `
========================================================
  Predicate Tree Examples
========================================================

Usage: ./index-run.sh [options]
       npx ts-node index.ts [options]

Options:
  --help, -h            Show this help message
  --validated, -v       Run the example WITH subject dictionary validation
  --non-validated, -n   Run the example WITHOUT subject dictionary validation
  --labelled, -l        Run the example WITH multilingual labels
  --all, -a             Run all examples

If no options are provided, this help message will be displayed.

Examples:
  ./index-run.sh --validated      Run only the validated example
  ./index-run.sh --non-validated  Run only the non-validated example
  ./index-run.sh --labelled       Run only the labelled example
  ./index-run.sh --all            Run all examples
========================================================`;

  console.log(helpText);
}

// Function to run an example with appropriate messaging
function runExample(exampleFn: () => void, description: string) {
  console.log(`Running ${description}...\n`);
  exampleFn();
}

// Show help by default if no specific example is requested
if (showHelp && !runValidated && !runNonValidated && !runLabelled && !runBoth) {
  showHelpMessage();
  process.exit(0);
}

// Run the examples based on command line args
if (runBoth) {
  const message = "Running all predicate tree examples...";
  console.log(message + "\n");

  runPredicateTreeValidationExample();
  console.log("\n\n");
  runPredicateTreeWithoutDictionaryExample();
  console.log("\n\n");
  runLabelledPredicateTreeExample();
} else {
  // Run requested examples
  if (runValidated) {
    runExample(
      runPredicateTreeValidationExample,
      "predicate tree WITH subject dictionary validation"
    );
    console.log("\n");
  }

  if (runNonValidated) {
    runExample(
      runPredicateTreeWithoutDictionaryExample,
      "predicate tree WITHOUT subject dictionary validation"
    );
    console.log("\n");
  }

  if (runLabelled) {
    runExample(
      runLabelledPredicateTreeExample,
      "predicate tree WITH multilingual labels"
    );
  }
}
