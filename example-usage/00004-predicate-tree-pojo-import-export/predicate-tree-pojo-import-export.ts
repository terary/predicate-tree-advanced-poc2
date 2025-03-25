/**
 * Predicate Tree POJO Import/Export Example
 *
 * This file demonstrates how to import and export predicate trees as Plain Old JavaScript Objects (POJO).
 */

import * as fs from "fs";
import * as path from "path";
// Import PredicateTree - we can now use its static methods directly
import { PredicateTree, PojoDocs } from "./assets/PredicateTree";
import { NotTree } from "./assets/NotTree";

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
  console.log("\n===== DEMONSTRATING COMPLEX TREE WITH SUBTREE =====");

  // Read the complex tree with subtree file
  // const complexTreePath = "./assets/complex-tree-with-subtree.pojo.json";
  const complexTreePath =
    "/mypart/tmc/projects/predicate-tree-advanced-poc2/example-usage/00004-predicate-tree-pojo-import-export/assets/complex-tree-with-subtree.pojo.json";
  const complexTreeJson = fs.readFileSync(complexTreePath, "utf8");
  const complexTreePojo = JSON.parse(complexTreeJson) as PojoDocs;

  // The fromPojo method will automatically create the appropriate subtree types
  const tree = PredicateTree.fromPojo(complexTreePojo as any) as PredicateTree;

  const allSubtrees = tree.getSubtreeIdsAt();
  console.log(`Found ${allSubtrees.length} subtrees:`, allSubtrees);

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
  cloneTreePojo["complexDemo:4"].nodeType = "subtree:NotTree";
  const cloneTree = PredicateTree.fromPojo(cloneTreePojo as any);

  const cloneSubtreeIds = cloneTree.getSubtreeIdsAt();
  console.log(`Found ${cloneSubtreeIds.length} subtrees`);

  if (!cloneSubtreeIds || cloneSubtreeIds.length == 0) {
    throw Error("Failed to create subtree correctly");
  }
  console.log("✅ PASS: Subtrees cloned as expected");
}
