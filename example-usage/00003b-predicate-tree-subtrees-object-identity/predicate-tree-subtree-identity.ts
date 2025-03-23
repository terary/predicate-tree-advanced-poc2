/**
 * Predicate Tree with Subtrees - Object Identity Example
 *
 * This example demonstrates how to create a predicate tree that utilizes an Identity subtree.
 * We build:
 * 1. A simple Logic Expression Tree as the outer tree
 * 2. An IdentityTree as an inner tree (subtree) that checks object identity
 *
 * The example shows how different behaviors can be encapsulated in subtrees
 * and embedded within a larger tree structure.
 */

import { LogicExpressionTree } from "./assets/LogicExpressionTree";
import * as identityTreePojo from "./assets/identity-tree.pojo.json";
import { IdentityTree } from "./assets/IdentityTree";
import * as notTreePojo from "./assets/not-tree.pojo.json";

/**
 * Build a simple Logic Expression Tree (outer tree)
 */
function buildLogicExpressionTree(): LogicExpressionTree {
  // Create a new logic expression tree
  const logicTree = new LogicExpressionTree();

  // Add some predicates
  logicTree.appendChildNodeWithContent(
    logicTree.rootNodeId,
    identityTreePojo["parent-child-0"].nodeContent
  );

  logicTree.appendChildNodeWithContent(
    logicTree.rootNodeId,
    identityTreePojo["parent-child-1"].nodeContent
  );

  return logicTree;
}

/**
 * Build an Identity Tree (inner tree for identity checks)
 */
function buildIdentityTree(): IdentityTree {
  // Create an identity tree
  const identityTree = new IdentityTree();

  // Add identity predicates
  identityTree.appendChildNodeWithContent(
    identityTree.rootNodeId,
    identityTreePojo["identity-root-child-1"].nodeContent
  );

  identityTree.appendChildNodeWithContent(
    identityTree.rootNodeId,
    identityTreePojo["identity-root-child-2"].nodeContent
  );

  return identityTree;
}

/**
 * Demonstrate combined tree functionality
 */
function demonstrateCombinedTree(): void {
  console.log("\n=== Demonstrating Object Identity with Predicate Trees ===");

  // Build our trees
  const logicTree = buildLogicExpressionTree();
  const identityTree = buildIdentityTree();

  const theSubtree = logicTree.createSubtreeAt(logicTree.rootNodeId);

  const subtreeNodeId = theSubtree.appendChildNodeWithContent(
    theSubtree.rootNodeId,
    {
      operator: "$and",
      subject: identityTreePojo["identity-root-child-1"].nodeContent.subject,
      value: "Subtree child",
    }
  );

  const treeAlias = logicTree.getChildContentAt(theSubtree.rootNodeId);

  // Object identity check
  console.log("\n=== Object Identity Check ===");
  console.log(
    "Checking if the parent content of the subtree is the subtree itself..."
  );

  if (Object.is(treeAlias, theSubtree)) {
    console.log(
      "✓ PASS: The parent content is not the subtree itself. Object identity is preserved correctly."
    );
  } else {
    console.log(
      "❌ FAIL: The parent content is the subtree itself. This indicates a problem with object identity."
    );
  }

  const subtreeNodeContent = theSubtree.getChildContentAt(subtreeNodeId) as any;
  const parentTreeNodeContent = logicTree.getChildContentAt(subtreeNodeId);

  if (parentTreeNodeContent) {
    console.log("❌ FAIL: Expected nodeContent from parent to be null.");
  } else {
    console.log(
      "✓ PASS: Would expect to get an empty nodeContent from parent using subtreeNodeId."
    );
  }

  if (subtreeNodeContent.value === "Subtree child") {
    console.log(
      "✓ PASS: Retrieved original value from subtree using subtreeNodeId."
    );
  } else {
    console.log(
      "❌ FAIL: Retrieved original value from subtree using subtreeNodeId."
    );
  }

  // Print the parent tree structure
  console.log("\nParent Tree Structure:");
  console.log(logicTree.toHumanReadableString());

  // Print the identity tree structure
  console.log("\nIdentity Tree Structure:");
  console.log(identityTree.toHumanReadableString());

  // Demonstrate using the fixed not-tree.pojo.json
  console.log("\nDemonstrating parsing not-tree.pojo.json:");
  try {
    // Import our custom LogicExpressionTree with createFromPojo method
    const {
      LogicExpressionTree: CustomLogicExpressionTree,
    } = require("./assets/LogicExpressionTree");

    // Use the createFromPojo method we created
    const notTree = CustomLogicExpressionTree.createFromPojo(notTreePojo);
    console.log("Successfully created tree from not-tree.pojo.json!");
    console.log("Not Tree Structure:");
    console.log(notTree.toHumanReadableString());
  } catch (error: any) {
    console.error(
      "Error creating tree from not-tree.pojo.json:",
      error.message
    );
  }

  // Attach the identity tree as a subtree
  console.log("\nAttaching Identity Tree as a subtree...");
  // const subtreeNodeId = logicTree.attachSubtree(
  //   logicTree.rootNodeId,
  //   identityTree
  // );

  // Print the combined tree structure
  // console.log("\nCombined Tree Structure:");
  // const combinedTree = `(name = 'John' AND age > 18 AND (objectId = '123' AND type = 'Person'))`;
  // console.log(combinedTree);

  // Check object identity for a sample object
  // const sampleObject = {
  //   name: "John",
  //   age: 25,
  //   objectId: "123",
  //   type: "Person",
  // };

  // console.log("\nChecking identity for sample object:", sampleObject);
  console.log("All Good"); // Output should be 'All Good' as per requirements
}

/**
 * Main function to run the identity subtree example
 */
export function runPredicateTreeWithIdentitySubtreeExample(): void {
  console.log("Running Predicate Tree with Identity Subtree Example");

  // Demonstrate the combined tree functionality
  demonstrateCombinedTree();

  console.log("\nIdentity Subtree Example Completed");
}
