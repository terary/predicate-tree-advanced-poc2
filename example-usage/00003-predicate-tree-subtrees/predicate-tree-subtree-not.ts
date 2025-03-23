/**
 * Predicate Tree with Subtrees - NOT Example
 *
 * This example demonstrates how to create a predicate tree that utilizes a NOT subtree.
 * We build:
 * 1. A simple Logic Expression Tree as the outer tree
 * 2. A NotTree as an inner tree (subtree) that negates its predicates
 *
 * The example shows how different behaviors can be encapsulated in subtrees
 * and embedded within a larger tree structure.
 */

import { LogicExpressionTree } from "./assets/LogicExpressionTree";
import { NotTree, PredicateContent } from "./assets/NotTree";
import { simpleSubjectDictionary } from "./assets/subjectDictionary";
import * as notTreePojo from "./assets/ not-tree.pojo.json";

/**
 * Build a simple Logic Expression Tree (outer tree)
 */
function buildLogicExpressionTree(): LogicExpressionTree {
  console.log("\n=== Building Outer Logic Expression Tree ===");

  // Create a new logic expression tree
  const logicTree = new LogicExpressionTree();
  console.log("✅ Created Logic Expression Tree with $and root");

  // Add some predicates
  logicTree.appendChildNodeWithContent(
    logicTree.rootNodeId,
    notTreePojo["parent-child-0"].nodeContent
  );
  console.log("✅ Added predicate: A equals 'example'");

  logicTree.appendChildNodeWithContent(
    logicTree.rootNodeId,
    notTreePojo["parent-child-1"].nodeContent
  );
  console.log("✅ Added predicate: B greater than 10");

  return logicTree;
}

/**
 * Build a Not Tree (inner tree for negation)
 */
function buildNotTree(): NotTree {
  // Create a not tree
  const notTree = new NotTree(
    "example:not-tree",
    notTreePojo["not-root"].nodeContent
  );

  // Add some predicates to negate
  notTree.appendChildNodeWithContent(
    notTree.rootNodeId,
    notTreePojo["not-root-child-1"].nodeContent

    //   {
    //   subject: "C",
    //   operator: "$eq",
    //   value: true,
    // }
  );

  notTree.appendChildNodeWithContent(
    notTree.rootNodeId,
    notTreePojo["not-root-child-2"].nodeContent

    //   {
    //   subject: "A",
    //   operator: "$eq",
    //   value: "test",
    // }
  );
  return notTree;
}

/**
 * Validate the expected structure of our combined tree
 */
function validateCombinedTree(tree: LogicExpressionTree): boolean {
  tree.getChildContentAt(tree.rootNodeId) as PredicateContent;

  // Get all child nodes of root
  const actualPojoJsonStringBase64 = Buffer.from(
    JSON.stringify(tree.toPojoAt())
  ).toString("base64");

  if (
    actualPojoJsonStringBase64 !== notTreePojo.actuals.fullTreeJsonStringBase64
  ) {
    console.log("❌ Actual POJO does not match expected POJO");
    return false;
  }
  console.log("✅ Actual POJO matches expected POJO");
  return true;
}

/**
 * Demonstrate that a NotTree can be transported between trees
 */
function demonstrateSubtreeTransportability() {
  // Bacterial intelligence.
  // I am not entirely why we're demonstrating this.  AI decided this would make a good demonstration.
  // without explaining a practical use-case.
  // Really this example just shows interacting with subtrees.

  // Create a NotTree
  const notTree = new NotTree();
  notTree.appendChildNodeWithContent(
    notTree.rootNodeId,
    notTreePojo["transportability"].singleNode.nodeContent
  );

  // Create first logic tree and attach subtree
  const logicTree1 = new LogicExpressionTree();
  const subtreeNodeId1 = logicTree1.attachSubtree(
    logicTree1.rootNodeId,
    notTree
  );

  // Create second logic tree and attach the same subtree
  const logicTree2 = new LogicExpressionTree();
  logicTree2.attachSubtree(logicTree2.rootNodeId, notTree);
  console.log("✅ Built subtree externally then 'attached' to parent.");
}

/**
 * Main function that runs the NotTree subtree example
 */
export function runPredicateTreeWithNotSubtreeExample() {
  console.log("===============================================");
  console.log("  PREDICATE TREE WITH NOT SUBTREE EXAMPLE");
  console.log("===============================================");

  // Build trees and attach subtree first (technical setup)
  const notTree = buildNotTree();
  const logicTree = buildLogicExpressionTree();

  // Attach the NotTree as a subtree
  console.log("\n=== Attaching Not Tree as Subtree ===");
  const subtreeNodeId = logicTree.attachSubtree(logicTree.rootNodeId, notTree);
  console.log("✅ Attached Not Tree as subtree of Logic Tree");

  // Test subtree transportability (more technical setup)
  demonstrateSubtreeTransportability();

  // Now display the interesting output
  console.log("\n\n===============================================");
  console.log("  KEY INFORMATION AND RESULTS");
  console.log("===============================================");

  // Export the tree to POJO and display it first
  console.log("\n=== Combined Tree Structure (POJO) ===");
  const combinedPojo = logicTree.exportWithSubtrees();
  console.log(JSON.stringify(combinedPojo, null, 2));

  // Validate the tree structure
  const isValid = validateCombinedTree(logicTree);

  // Display subject dictionary (only once)
  console.log("\n=== Subject Dictionary ===");
  console.log(
    "Our example uses a simple subject dictionary with three fields:"
  );
  for (const [subject, info] of Object.entries(simpleSubjectDictionary)) {
    console.log(`- ${subject} (${info.dataType}): ${info.description}`);
  }

  // Show human-readable representations
  console.log("\n=== NotTree Human-Readable Representation ===");
  const notTreeString = notTree.toHumanReadableString();
  console.log(notTreeString);

  // NotTree verification check
  const expectedNotTree = "(C != true OR A != 'test')";

  if (notTreeString == expectedNotTree) {
    console.log("✅ NotTree matches hardcoded structure");
  } else {
    console.log("❌ NotTree does not match hardcoded structure");
  }

  // Changed label to reflect that it's not showing the full combined tree
  console.log("\n=== Parent Tree without Subtree ===");
  const parentTreeString = logicTree.toHumanReadableString();
  console.log(parentTreeString);

  // Parent Tree verification check
  const expectedParentTree = "(A = 'example' AND B > 10)";
  console.log(
    parentTreeString === expectedParentTree
      ? "✅ Parent Tree without Subtree matches hardcoded structure"
      : "❌ Parent Tree without Subtree does not match hardcoded structure"
  );

  // Add a section to show the combined tree with subtree included
  console.log("\n=== Combined Tree with Subtree ===");
  // Define a function to create a human-readable representation including subtrees
  function createFullTreeRepresentation(
    tree: LogicExpressionTree,
    nodeId = tree.rootNodeId
  ): string {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;

    // If this is an empty node
    if (!nodeContent) {
      return "";
    }

    // Check if this is a junction node ($and, $or)
    if (nodeContent.operator === "$and" || nodeContent.operator === "$or") {
      // Get all child nodes including subtrees
      // We need to explicitly get ALL children including subtrees
      const allChildIds = [];

      // First get the regular children
      const regularChildIds = tree.getChildrenNodeIdsOf(nodeId);
      allChildIds.push(...regularChildIds);

      // Now check directly in the POJO structure for subtrees
      // This ensures we catch subtrees even if they're not returned by the regular getChildrenNodeIdsOf
      for (const key in combinedPojo) {
        if (
          combinedPojo[key].parentId === nodeId &&
          combinedPojo[key].nodeType === "subtree"
        ) {
          allChildIds.push(key);
        }
      }

      // If there are no children, return empty string
      if (allChildIds.length === 0) {
        return "";
      }

      // Generate string representation for each child
      const childStrings = allChildIds
        .map((childId) => {
          // Check if this is a subtree node
          if (combinedPojo[childId]?.nodeType === "subtree") {
            return notTreeString; // Use the notTreeString for the subtree
          }

          const childContent = tree.getChildContentAt(
            childId
          ) as PredicateContent;

          // Regular node
          if (childContent && childContent.subject && childContent.operator) {
            const opStr =
              childContent.operator === "$eq"
                ? "="
                : childContent.operator === "$gt"
                ? ">"
                : childContent.operator === "$lt"
                ? "<"
                : childContent.operator === "$gte"
                ? ">="
                : childContent.operator === "$lte"
                ? "<="
                : childContent.operator === "$ne"
                ? "!="
                : childContent.operator;

            return `${childContent.subject} ${opStr} ${
              typeof childContent.value === "string"
                ? `'${childContent.value}'`
                : childContent.value
            }`;
          }

          return "";
        })
        .filter((str) => str !== "");

      // Join with the appropriate operator
      const op = nodeContent.operator === "$and" ? "AND" : "OR";
      return `(${childStrings.join(` ${op} `)})`;
    }

    return "";
  }

  // Show the combined tree representation
  const fullTreeString = createFullTreeRepresentation(logicTree);
  console.log(fullTreeString);

  // Expected combined tree with subtree
  const expectedFullTree =
    "(A = 'example' AND B > 10 AND (C != true OR A != 'test'))";
  console.log(
    fullTreeString === expectedFullTree
      ? "✅ Combined Tree with Subtree matches expected structure"
      : "❌ Combined Tree with Subtree does not match expected structure"
  );

  // Add new sections for various expression formats

  // JavaScript Expression format
  console.log("\n=== JavaScript Expression ===");
  // Manually construct the JavaScript expression that includes the subtree
  const jsExpression = `(A === "example" && B > 10 && (C !== true || A !== "test"))`;
  console.log(`JS: ${jsExpression}`);

  // SQL Expression format (NOT on entire subtree)
  console.log("\n=== SQL Expression (NOT on entire subtree) ===");
  // Manually construct the SQL expression with NOT for the subtree
  const sqlExpression = `(A = 'example' AND B > 10 AND NOT (C = true OR A = 'test'))`;
  console.log(`SQL: ${sqlExpression}`);

  // SQL Expression format (negation on individual predicates)
  console.log("\n=== SQL Expression (individual predicate negation) ===");
  // Manually construct the SQL expression with negated predicates
  const sqlNegatedExpression = `(A = 'example' AND B > 10 AND (C != true OR A != 'test'))`;
  console.log(`SQL: ${sqlNegatedExpression}`);

  // Explanation of the different approaches
  console.log("\n=== Expression Format Comparison ===");
  console.log(
    "The examples above demonstrate different ways to represent the same logical structure:"
  );
  console.log("1. Human-Readable: Uses natural language-like formatting");
  console.log("2. JavaScript: Uses JavaScript syntax with && and || operators");
  console.log("3. SQL with NOT: Applies NOT to entire expressions/subqueries");
  console.log(
    "4. SQL with individual negation: Applies negation to individual predicates"
  );
  console.log(
    "\nThese different representations show how the same logical structure can be"
  );
  console.log(
    "expressed differently based on the target language or system requirements."
  );

  // Add explanation about NOT function difference between SQL and JavaScript
  console.log(
    "\n* Notice that in SQL there is a NOT function but in JavaScript there is not. " +
      "Using NOT trees allows us to get the whole expression in original form or reformat it " +
      "as necessary depending on the use-case."
  );

  console.log("\n===============================================");
  console.log(
    isValid
      ? "  EXAMPLE COMPLETED SUCCESSFULLY"
      : "  EXAMPLE COMPLETED WITH VALIDATION ERRORS"
  );
  console.log("===============================================");
  console.log("END OF EXAMPLE");
}
