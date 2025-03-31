/**
 * Predicate Tree with Subtrees Object Identity Examples
 *
 * This file serves as the entry point for examples demonstrating
 * how to use predicate trees with subtrees for object identity checks.
 */

import { runPredicateTreeWithIdentitySubtreeExample } from "./example-subtree-identity";

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes("--help") || args.includes("-h");
const runIdentityExample = args.includes("--identity") || args.includes("-i");
const runAll = args.includes("--all") || args.includes("-a");

/**
 * Display help information
 */
function showHelpMessage() {
  console.log("========================================================");
  console.log("  Predicate Tree with Subtrees - Object Identity Examples");
  console.log("========================================================");
  console.log("");
  console.log("Usage: npx ts-node index.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h         Show this help message");
  console.log("  --identity, -i     Run the Identity subtree example");
  console.log("  --all, -a          Run all examples");
  console.log("");
  console.log(
    "If no options are provided, the Identity subtree example will run by default."
  );
  console.log("");
  console.log("Examples:");
  console.log(
    "  npx ts-node index.ts --identity   Run the Identity subtree example"
  );
  console.log("  npx ts-node index.ts --all        Run all examples");
  console.log("========================================================");
}

// Show help if explicitly requested
if (showHelp) {
  showHelpMessage();
  process.exit(0);
}

// Run examples based on command line args or run Identity example by default
if (runAll || runIdentityExample || args.length === 0) {
  runPredicateTreeWithIdentitySubtreeExample();
}
