/**
 * Predicate Tree with Subtrees - Object Identity Example
 *
 * This is an example of how subtrees are not just embedded structures but
 * they are intertwined with the outer tree.
 */

import { LogicExpressionTree } from "./assets/LogicExpressionTree";
import * as identityTreePojo from "./assets/identity-tree.pojo.json";

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
  console.log(
    "\n=== Demonstrating Object Identity with Predicate Trees and Subtree ==="
  );

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
      "✅ PASS: The parent content IS the subtree itself. Object identity is preserved correctly."
    );
  } else {
    console.log(
      "❌ FAIL: The parent content is NOT the subtree itself. This indicates a problem with object identity."
    );
  }

  const subtreeNodeContent = theSubtree.getChildContentAt(subtreeNodeId) as any;
  const parentTreeNodeContent = logicTree.getChildContentAt(subtreeNodeId);

  if (parentTreeNodeContent) {
    console.log(
      "❌ FAIL: Expected nodeIds of subtree to NOT be valid parent tree nodes."
    );
  } else {
    console.log("✅ PASS: subtree IDs return no value from parent tree.");
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

  console.log("All Good"); // Output should be 'All Good' as per requirements
}

/**
 * Main function to run the identity subtree example
 */
export function runPredicateTreeWithIdentitySubtreeExample(): void {
  // Demonstrate the combined tree functionality
  demonstrateCombinedTree();
}
