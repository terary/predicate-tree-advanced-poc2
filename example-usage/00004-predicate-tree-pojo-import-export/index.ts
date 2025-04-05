/**
 * Predicate Tree POJO Import/Export Examples
 *
 * This file serves as the entry point for examples demonstrating
 * how to import and export predicate trees as Plain Old JavaScript Objects (POJO).
 */

import { demonstrateComplexTreeWithSubtree } from "./example-basic-subtrees";
import { runComplexPojoExample } from "./example-complex-subtrees";
import { runArithmeticTreeExamples } from "./example-arithmetic-operations";

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes("--help") || args.includes("-h");
const runBasicExample = args.includes("--basic") || args.includes("-b");
const runComplexExample = args.includes("--complex") || args.includes("-c");
const runArithmeticExample =
  args.includes("--arithmetic") || args.includes("-a");
const runAll = args.includes("--all") || args.includes("--all-examples");

/**
 * Display help information
 */
function showHelpMessage() {
  console.log("========================================================");
  console.log("  Predicate Tree POJO Import/Export Examples");
  console.log("========================================================");
  console.log("");
  console.log("Usage: npx ts-node index.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --help, -h              Show this help message");
  console.log(
    "  --basic, -b             Run the basic POJO import/export example"
  );
  console.log(
    "  --complex, -c           Run the complex POJO import/export example"
  );
  console.log("  --arithmetic, -a        Run the arithmetic tree example");
  console.log("  --all, --all-examples   Run all examples");
  console.log("");
  console.log(
    "If no options are provided, the complex example will run by default."
  );
  console.log("");
  console.log("Examples:");
  console.log(
    "  npx ts-node index.ts --basic        Run the basic POJO example"
  );
  console.log(
    "  npx ts-node index.ts --complex      Run the complex POJO example"
  );
  console.log(
    "  npx ts-node index.ts --arithmetic   Run the arithmetic tree example"
  );
  console.log("  npx ts-node index.ts --all          Run all examples");
  console.log("========================================================");
}

// Show help if explicitly requested
if (showHelp) {
  showHelpMessage();
  process.exit(0);
}

// Run examples based on command line args or run complex example by default
if (runAll || runBasicExample) {
  demonstrateComplexTreeWithSubtree();
}

if (runAll || runComplexExample || args.length === 0) {
  runComplexPojoExample();
}

if (runAll || runArithmeticExample) {
  runArithmeticTreeExamples();
}
