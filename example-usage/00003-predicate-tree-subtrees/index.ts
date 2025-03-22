/**
 * Predicate Tree with Subtrees Examples
 *
 * This file serves as the entry point for various examples demonstrating
 * how to use predicate trees with subtrees. Each example is implemented
 * in its own file and can be run individually.
 *
 * Examples included:
 * 1. NOT Tree Subtree - Demonstrates negating predicates with a specialized subtree
 * (More examples will be added in the future)
 */

import { runPredicateTreeWithNotSubtreeExample } from "./predicate-tree-subtree-not";

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes("--help") || args.includes("-h");
const runNotExample = args.includes("--not") || args.includes("-n");
const runAll = args.includes("--all") || args.includes("-a");

/**
 * Display help information
 */
function showHelpMessage() {
  console.log("========================================================");
  console.log("  Predicate Tree with Subtrees Examples");
  console.log("========================================================");
  console.log("");
  console.log("Usage: npx ts-node index.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h      Show this help message");
  console.log("  --not, -n       Run the NOT subtree example");
  console.log("  --all, -a       Run all examples");
  console.log("");
  console.log(
    "If no options are provided, the NOT subtree example will run by default."
  );
  console.log("");
  console.log("Examples:");
  console.log("  npx ts-node index.ts --not       Run the NOT subtree example");
  console.log("  npx ts-node index.ts --all       Run all examples");
  console.log("========================================================");
}

// Show help if explicitly requested
if (showHelp) {
  showHelpMessage();
  process.exit(0);
}

// Run examples based on command line args or run NOT example by default
if (runAll || runNotExample || args.length === 0) {
  runPredicateTreeWithNotSubtreeExample();
}
