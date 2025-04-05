/**
 * Predicate Tree POJO Import/Export Example
 *
 * This file demonstrates how to import and export predicate trees as Plain Old JavaScript Objects (POJO).
 */

import * as fs from "fs";
import * as path from "path";
// Import PredicateTree - we can now use its static methods directly
import { PredicateTree, PojoDocs } from "./common/classes/PredicateTree";
import { NotTree } from "./common/classes/NotTree";

// Set up paths for samples and outputs
const assetsDir = path.join(__dirname, "common/pojo");
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
  const complexTreePath = path.join(
    assetsDir,
    "complex-tree-with-subtree.pojo.json"
  );
  const complexTreeJson = fs.readFileSync(complexTreePath, "utf8");
  const complexTreePojo = JSON.parse(complexTreeJson) as PojoDocs;

  // The fromPojo method will automatically create the appropriate subtree types
  const tree = PredicateTree.fromPojo(complexTreePojo as any) as PredicateTree;

  const allSubtrees = tree.getSubtreeIdsAt();
  // console.log(`Found ${allSubtrees.length} subtrees:`, allSubtrees);
  // ^-- A CURSOR HACK THAT I HAVE FIXED SEVERAL TIMES - LEAVING IT SO CURSOR WILL QUIT PUTTING THIS SHIT HERE

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

  // Fix the nodeType for subtrees so they're recognized during import
  // const subtreeIds = tree.getSubtreeIdsAt();

  // for (const subtreeId of subtreeIds) {
  //   const subtree = tree.getChildContentAt(subtreeId);
  //   // Check if it's a subtree instance
  //   if (subtree && typeof subtree === "object" && "rootNodeId" in subtree) {
  //     // Get the content of the subtree's root node to determine its type
  //     const subtreeRootContent = (subtree as any).getChildContentAt(
  //       (subtree as any).rootNodeId
  //     );
  //     // Check if the content has the _meta.negated property which indicates it's a NotTree
  //     if (
  //       subtreeRootContent &&
  //       subtreeRootContent._meta &&
  //       subtreeRootContent._meta.negated
  //     ) {
  //       // Set the correct nodeType for the subtree
  //       cloneTreePojo[subtreeId].nodeType = "subtree:NotTree";
  //     }
  //   }
  // }

  const cloneTree = PredicateTree.fromPojo(cloneTreePojo as any);

  const cloneSubtreeIds = cloneTree.getSubtreeIdsAt();
  console.log(`Found ${cloneSubtreeIds.length} subtrees`);

  if (!cloneSubtreeIds || cloneSubtreeIds.length == 0) {
    throw Error("Failed to create subtree correctly");
  }
  console.log("✅ PASS: Subtrees cloned as expected");
}
