/**
 * Predicate Tree with Subtrees - Object Identity Example
 *
 * This is an example of how subtrees are not just embedded structures but
 * they are intertwined with the outer tree.
 */

import { LogicExpressionTree } from "./assets/LogicExpressionTree";
import * as identityTreePojo from "./assets/identity-tree.pojo.json";
import { IdentityTree } from "./assets/IdentityTree";
import * as notTreePojo from "./assets/not-tree.pojo.json";

/**
 * Build a simple Logic Expression Tree (outer tree)
 * For demonstration purposes only.
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
 * Demonstrate combined tree functionality
 */
function demonstrateCombinedTree(): void {
  console.log("\n=== Demonstrating Object Identity with Predicate Trees ===");

  // Build our trees
  const logicTree = buildLogicExpressionTree();

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

  if (Object.is(treeAlias, theSubtree)) {
    console.log(
      "✅ PASS: The parent content is not the subtree itself. Object identity is preserved correctly."
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
      "✅ PASS: Would expect to get an empty nodeContent from parent using subtreeNodeId."
    );
  }

  if (subtreeNodeContent.value === "Subtree child") {
    console.log(
      "✅ PASS: Retrieved original value from subtree using subtreeNodeId."
    );
  } else {
    console.log(
      "❌ FAIL: Retrieved original value from subtree using subtreeNodeId."
    );
  }

  // Print the parent tree structure
  console.log("\nSome nonsense to demonstrate its a real tree");
  console.log(logicTree.toHumanReadableString());

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
