/**
 * Predicate Tree POJO Import/Export Complex Example
 *
 * This file demonstrates how to import and export complex predicate trees as Plain Old JavaScript Objects (POJO).
 */

import * as fs from "fs";
import * as path from "path";
// Import PredicateTree - we can now use its static methods directly
import { PredicateTree, PojoDocs } from "./assets/PredicateTree";
import { NotTree } from "./assets/NotTree";
import { ArithmeticTree } from "./assets/ArithmeticTree";

// Set up paths for samples and outputs
const assetsDir = path.join(__dirname, "assets");
const outputsDir = path.join(__dirname, "outputs");

// Ensure outputs directory exists
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir);
}

/**
 * Demonstrate working with a complex tree that includes subtrees
 */
export function demonstrateComplexTreeWithSubtree(): void {
  console.log("\n===== DEMONSTRATING COMPLEX. TREE WITH SUBTREE =====");

  // Read the complex tree with subtree file
  const complexTreePath = path.join(
    assetsDir,
    "complex-tree-with-subtree.pojo.json"
  );
  const complexTreeJson = fs.readFileSync(complexTreePath, "utf8");

  const complexTreePojo = JSON.parse(complexTreeJson) as PojoDocs;

  // The fromPojo method will automatically create the appropriate subtree types
  const tree = PredicateTree.fromPojo(complexTreePojo as any) as PredicateTree;

  // Create an arithmetic subtree with addition and two operands
  const arithmeticSubtree = tree.createSubtreeArithmeticTree(tree.rootNodeId);

  // Set the operator to $add for addition
  arithmeticSubtree.replaceNodeContent(arithmeticSubtree.rootNodeId, {
    operator: "$add",
    subjectLabel: "Addition Example",
  });

  // Add first operand: 25
  arithmeticSubtree.appendChildNodeWithContent(arithmeticSubtree.rootNodeId, {
    value: 100,
    subjectLabel: "First Operand",
  });

  // Add second operand: 75
  arithmeticSubtree.appendChildNodeWithContent(arithmeticSubtree.rootNodeId, {
    value: 101,
    subjectLabel: "Second Operand",
  });

  // Add second operand: 75
  const subtractBranchId = arithmeticSubtree.appendChildNodeWithContent(
    arithmeticSubtree.rootNodeId,
    {
      operator: "$subtract",
      subjectLabel: "Second Operand",
    }
  );
  arithmeticSubtree.appendChildNodeWithContent(subtractBranchId, {
    value: 102,
    subjectLabel: "First Operand (-)",
  });
  arithmeticSubtree.appendChildNodeWithContent(subtractBranchId, {
    value: 103,
    subjectLabel: "Second Operand (-)",
  });

  // Evaluate and log the result
  const arithmeticOriginalEvaluations = "x";
  console.log(`ArithmeticTree Result: ${arithmeticSubtree.toString()}`);

  const allSubtrees = tree.getSubtreeIdsAt();

  if (!allSubtrees || allSubtrees.length == 0) {
    throw Error("Failed to create subtree correctly");
  }

  console.log("✅ PASS: Subtrees were created correctly");

  // ---
  // Get the first subtree
  const subtreeNodeId = allSubtrees[0];
  const subtree = tree.getChildContentAt(subtreeNodeId) as any;

  // Check if rootNodeId matches the subtreeNodeId
  if (subtree.rootNodeId === subtreeNodeId) {
    console.log("✅ PASS: Subtree rootNodeId matches parent nodeId");
  } else {
    console.log("❌ FAIL: Subtree rootNodeId does not match parent nodeId");
  }

  // Check object identity by comparing properties
  const subtreeAlias = tree.getChildContentAt(subtreeNodeId);
  if (Object.is(subtree, subtreeAlias)) {
    console.log("✅ PASS: Object identity is preserved");
  } else {
    console.log("❌ FAIL: Object identity is not preserved");
  }

  // export/import
  subtree.appendChildNodeWithContent(subtree.rootNodeId, {
    operator: "$eq",
    value: "Hope to see you clone-side",
    subjectId: "_SUBTREE_TEST_",
  });

  const cloneTreePojo = tree.toPojoAt();

  // Write the cloned tree POJO to a file
  const clonedPojoPath = path.join(outputsDir, "cloned.pojo.json");
  fs.writeFileSync(
    clonedPojoPath,
    JSON.stringify(cloneTreePojo, null, 2),
    "utf8"
  );
  console.log(`Saved cloned tree POJO to ${clonedPojoPath}`);

  const cloneTree = PredicateTree.fromPojo(cloneTreePojo as any);

  const cloneSubtreeIds = cloneTree.getSubtreeIdsAt();
  console.log(`Found ${cloneSubtreeIds.length} subtrees`);

  if (!cloneSubtreeIds || cloneSubtreeIds.length == 0) {
    throw Error("Failed to create subtree correctly");
  }
  console.log("✅ PASS: Subtrees cloned as expected");
}

/**
 * Demonstrate a basic arithmetic tree
 */
function demonstrateBasicArithmeticTree(): void {
  console.log("\n===== DEMONSTRATING BASIC ARITHMETIC TREE =====");

  // Create a basic addition tree
  const additionTree = new ArithmeticTree("aTree", {
    operator: "$add",
    subjectLabel: "Basic Addition",
  });

  // Add two operands
  additionTree.appendChildNodeWithContent(additionTree.rootNodeId, {
    value: 25,
    subjectLabel: "First Value",
  });

  additionTree.appendChildNodeWithContent(additionTree.rootNodeId, {
    value: 75,
    subjectLabel: "Second Value",
  });

  // Evaluate and display the result
  console.log(additionTree.toString()); // Should output: "Basic Addition: 100"

  // Export to POJO
  const treePojo = additionTree.toPojoAt();
  console.log("Exported tree to POJO structure");
}

/**
 * Main function to run the complex POJO example
 */
export function runComplexPojoExample(): void {
  console.log("\n==================================================");
  console.log(" Running Complex Predicate Tree POJO Import/Export Example");
  console.log("==================================================\n");

  // Demonstrate complex tree functionality
  demonstrateComplexTreeWithSubtree();

  // Demonstrate basic arithmetic tree
  demonstrateBasicArithmeticTree();

  console.log("\nComplex POJO Example Completed");
}
