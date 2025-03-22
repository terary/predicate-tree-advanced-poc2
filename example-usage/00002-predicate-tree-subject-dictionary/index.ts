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
  console.log("========================================================");
  console.log("  Predicate Tree Examples");
  console.log("========================================================");
  console.log("");
  console.log("Usage: ./index-run.sh [options]");
  console.log("       npx ts-node index.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h            Show this help message");
  console.log(
    "  --validated, -v       Run the example WITH subject dictionary validation"
  );
  console.log(
    "  --non-validated, -n   Run the example WITHOUT subject dictionary validation"
  );
  console.log(
    "  --labelled, -l        Run the example WITH multilingual labels"
  );
  console.log("  --all, -a             Run all examples");
  console.log("");
  console.log(
    "If no options are provided, this help message will be displayed."
  );
  console.log("");
  console.log("Examples:");
  console.log(
    "  ./index-run.sh --validated      Run only the validated example"
  );
  console.log(
    "  ./index-run.sh --non-validated  Run only the non-validated example"
  );
  console.log(
    "  ./index-run.sh --labelled       Run only the labelled example"
  );
  console.log("  ./index-run.sh --all            Run all examples");
  console.log("========================================================");
}

// Show help by default if no specific example is requested
if (showHelp && !runValidated && !runNonValidated && !runLabelled && !runBoth) {
  showHelpMessage();
  process.exit(0);
}

// Run the examples based on command line args
if (runBoth) {
  console.log("Running all predicate tree examples...\n");
  runPredicateTreeValidationExample();
  console.log("\n\n");
  runPredicateTreeWithoutDictionaryExample();
  console.log("\n\n");
  runLabelledPredicateTreeExample();
} else {
  // Run requested examples
  if (runValidated) {
    console.log(
      "Running predicate tree WITH subject dictionary validation...\n"
    );
    runPredicateTreeValidationExample();
    console.log("\n");
  }

  if (runNonValidated) {
    console.log(
      "Running predicate tree WITHOUT subject dictionary validation...\n"
    );
    runPredicateTreeWithoutDictionaryExample();
    console.log("\n");
  }

  if (runLabelled) {
    console.log("Running predicate tree WITH multilingual labels...\n");
    runLabelledPredicateTreeExample();
  }
}
