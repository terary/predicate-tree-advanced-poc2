/**
 * Predicate Tree POJO Import/Export Example
 *
 * This example demonstrates how to:
 * 1. Import a predicate tree from a POJO document
 * 2. Create and modify a predicate tree
 * 3. Export a predicate tree to a POJO document
 * 4. Working with existing POJO documents
 * 5. Working with complex trees that include subtrees
 *
 * Note: This example uses a static factory pattern to implement the fromPojo method,
 * which allows creating PredicateTree instances from POJO documents.
 */

import * as fs from "fs";
import * as path from "path";
import { demonstrateComplexTreeWithSubtree } from "./predicate-tree-pojo-import-export";
import { PredicateTree } from "./assets/PredicateTree";

// Ensure outputs directory exists
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(outputsDir)) {
  console.log(`Creating outputs directory at: ${outputsDir}`);
  fs.mkdirSync(outputsDir);
}

// Enable debugging
console.log("Starting Predicate Tree POJO Import/Export Example");

try {
  // Demonstrate working with complex trees that include subtrees
  demonstrateComplexTreeWithSubtree();

  console.log("\nAll demonstrations completed successfully!");
  console.log(`Generated POJO files can be found in: ${outputsDir}`);
} catch (error: any) {
  console.error("\nAn error occurred:", error.message);
  console.error(error.stack);
}
