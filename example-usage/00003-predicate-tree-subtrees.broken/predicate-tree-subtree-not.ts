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
    notTreePojo["parent-child-0"].nodeContent
  );

  logicTree.appendChildNodeWithContent(
    logicTree.rootNodeId,
    notTreePojo["parent-child-1"].nodeContent
  );

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
  // Get all child nodes of root
  const actualPojoJsonStringBase64 = Buffer.from(
    JSON.stringify(tree.toPojoAt())
  ).toString("base64");

  return (
    actualPojoJsonStringBase64 == notTreePojo.actuals.fullTreeJsonStringBase64
  );
}

/**
 * Run smoke tests on the trees and report results
 */
function smokeTest(
  notTree: NotTree,
  logicTree: LogicExpressionTree,
  subtreeNodeId: string,
  combinedPojo: any
): boolean {
  console.log("\n=== Smoke Tests ===");

  // Test 1: Check if the POJO structure matches expected
  const isValidPojo = validateCombinedTree(logicTree);
  console.log(
    `POJO Structure  ${
      isValidPojo
        ? "✅ Actual POJO matches expected POJO"
        : "❌ Actual POJO does not match expected POJO"
    }`
  );

  // Test 2: Validate NotTree
  const notTreeString = notTree.toHumanReadableString();
  const expectedNotTree = "(C != true OR A != 'test')";
  const isValidNotTree = notTreeString === expectedNotTree;
  console.log(
    `${notTreeString}  ${
      isValidNotTree
        ? "✅ NotTree matches hardcoded structure"
        : "❌ NotTree does not match hardcoded structure"
    }`
  );

  // Test 3: Validate Parent Tree
  const parentTreeString = logicTree.toHumanReadableString();
  const expectedParentTree = "(A = 'example' AND B > 10)";
  const isValidParentTree = parentTreeString === expectedParentTree;
  console.log(
    `${parentTreeString}  ${
      isValidParentTree
        ? "✅ Parent Tree with Subtree matches hardcoded structure"
        : "❌ Parent Tree with Subtree matches hardcoded structure"
    }`
  );

  // Test 4: Validate subtree/parent tree nodeId relationship
  const subtree = logicTree.getChildContentAt(subtreeNodeId) as any;
  const isValidSubtreeRelation = subtreeNodeId === subtree.rootNodeId;
  console.log(
    `'Subtree/Parent tree nodeId relationship'  ${
      isValidSubtreeRelation
        ? "✅ Subtree and the thing parent points to are the same thing."
        : "❌ Subtree and the thing parent points to are DIFFERENT."
    }`
  );

  // Test 5: Validate Combined Tree
  const fullTreeString = createFullTreeRepresentation(logicTree, combinedPojo);
  const expectedFullTree =
    "(A = 'example' AND B > 10 AND (C != true OR A != 'test'))";
  const isValidFullTree = fullTreeString === expectedFullTree;
  console.log(
    `${fullTreeString}  ${
      isValidFullTree
        ? "✅ Parent Tree with Subtree matches hardcoded structure"
        : "❌ Parent Tree with Subtree matches hardcoded structure"
    }`
  );

  // Return overall test status - true if all tests passed
  return (
    isValidPojo &&
    isValidNotTree &&
    isValidParentTree &&
    isValidSubtreeRelation &&
    isValidFullTree
  );
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
}

/**
 * Create a human-readable representation of a tree including subtrees
 */
function createFullTreeRepresentation(
  tree: LogicExpressionTree,
  combinedPojo: any,
  nodeId = tree.rootNodeId
): string {
  // Check if this is a subtree node
  if (tree.isSubtree(nodeId)) {
    const subtree = tree.getChildContentAt(nodeId);
    if (
      subtree &&
      typeof subtree === "object" &&
      "toHumanReadableString" in subtree
    ) {
      // If it's a subtree with its own string representation method, use that
      return (subtree as any).toHumanReadableString();
    } else {
      return ""; // Fallback for unexpected subtree type
    }
  }
  // Check if this is a leaf node (simple predicate)
  else if (tree.isLeaf(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.subject && nodeContent.operator) {
      let opStr;
      switch (nodeContent.operator) {
        case "$eq":
          opStr = "=";
          break;
        case "$gt":
          opStr = ">";
          break;
        case "$lt":
          opStr = "<";
          break;
        case "$gte":
          opStr = ">=";
          break;
        case "$lte":
          opStr = "<=";
          break;
        case "$ne":
          opStr = "!=";
          break;
        default:
          opStr = nodeContent.operator;
      }

      const valueStr =
        typeof nodeContent.value === "string"
          ? `'${nodeContent.value}'`
          : nodeContent.value;

      return `${nodeContent.subject} ${opStr} ${valueStr}`;
    }
    return ""; // Empty leaf
  }
  // Must be a branch node (junction)
  else if (tree.isBranch(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.operator) {
      const op = nodeContent.operator === "$and" ? "AND" : "OR";

      // Get all children INCLUDING subtrees
      const childIds = tree.getChildrenNodeIdsOf(nodeId, true);
      if (childIds.length === 0) {
        return ""; // No children
      }

      // Process each child recursively
      const childStrings = childIds
        .map((childId) =>
          createFullTreeRepresentation(tree, combinedPojo, childId)
        )
        .filter((str) => str !== "");

      if (childStrings.length === 0) {
        return ""; // No valid children
      }

      // Join with appropriate operator and parentheses
      return childStrings.length === 1
        ? childStrings[0]
        : `(${childStrings.join(` ${op} `)})`;
    }
  }

  return ""; // Fallback for unexpected node type
}

/**
 * Generate a JavaScript representation of the tree
 */
function createJSRepresentation(
  tree: LogicExpressionTree,
  nodeId = tree.rootNodeId
): string {
  // Check if this is a subtree node
  if (tree.isSubtree(nodeId)) {
    const subtree = tree.getChildContentAt(nodeId);
    if (subtree && typeof subtree === "object") {
      // For NotTree specifically, handle the negated predicates
      if ("_meta" in subtree && subtree._meta?.negated) {
        const subChildIds = (subtree as any).getChildrenNodeIdsOf(
          (subtree as any).rootNodeId
        );
        if (subChildIds && subChildIds.length > 0) {
          const negatedPredicates = subChildIds
            .map((subChildId: string) => {
              const subContent = (subtree as any).getChildContentAt(
                subChildId
              ) as PredicateContent;
              if (subContent && subContent.subject && subContent.operator) {
                // Apply JS negation to the operator
                let opStr;
                switch (subContent.operator) {
                  case "$eq":
                    opStr = "!==";
                    break;
                  case "$ne":
                    opStr = "===";
                    break;
                  case "$gt":
                    opStr = "<=";
                    break;
                  case "$gte":
                    opStr = "<";
                    break;
                  case "$lt":
                    opStr = ">=";
                    break;
                  case "$lte":
                    opStr = ">";
                    break;
                  default:
                    opStr = subContent.operator;
                }

                const valueStr =
                  typeof subContent.value === "string"
                    ? `"${subContent.value}"`
                    : subContent.value;

                return `${subContent.subject} ${opStr} ${valueStr}`;
              }
              return "";
            })
            .filter((str: string) => str !== "");

          if (negatedPredicates.length > 0) {
            // Join with appropriate JavaScript operator (De Morgan's law)
            const joinOp =
              (subtree as any).getChildContentAt((subtree as any).rootNodeId)
                .operator === "$and"
                ? "||"
                : "&&";
            return `(${negatedPredicates.join(` ${joinOp} `)})`;
          }
        }
      }
      return ""; // Default case if no specific handling
    }
    return "";
  }
  // Check if this is a leaf node (simple predicate)
  else if (tree.isLeaf(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.subject && nodeContent.operator) {
      let opStr;
      switch (nodeContent.operator) {
        case "$eq":
          opStr = "===";
          break;
        case "$gt":
          opStr = ">";
          break;
        case "$lt":
          opStr = "<";
          break;
        case "$gte":
          opStr = ">=";
          break;
        case "$lte":
          opStr = "<=";
          break;
        case "$ne":
          opStr = "!==";
          break;
        default:
          opStr = nodeContent.operator;
      }

      const valueStr =
        typeof nodeContent.value === "string"
          ? `"${nodeContent.value}"`
          : nodeContent.value;

      return `${nodeContent.subject} ${opStr} ${valueStr}`;
    }
    return ""; // Empty leaf
  }
  // Must be a branch node (junction)
  else if (tree.isBranch(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.operator) {
      const op = nodeContent.operator === "$and" ? "&&" : "||";

      // Get all children INCLUDING subtrees
      const childIds = tree.getChildrenNodeIdsOf(nodeId, true);
      if (childIds.length === 0) {
        return ""; // No children
      }

      // Process each child recursively
      const childStrings = childIds
        .map((childId) => createJSRepresentation(tree, childId))
        .filter((str) => str !== "");

      if (childStrings.length === 0) {
        return ""; // No valid children
      }

      // Join with appropriate operator and parentheses
      return childStrings.length === 1
        ? childStrings[0]
        : `(${childStrings.join(` ${op} `)})`;
    }
  }

  return ""; // Fallback for unexpected node type
}

/**
 * Generate a SQL representation of the tree with NOT on the entire subtree
 */
function createSQLRepresentationWithNOT(
  tree: LogicExpressionTree,
  nodeId = tree.rootNodeId
): string {
  // Check if this is a subtree node
  if (tree.isSubtree(nodeId)) {
    const subtree = tree.getChildContentAt(nodeId);
    if (subtree && typeof subtree === "object") {
      // For NotTree specifically, handle the negated predicates
      if ("_meta" in subtree && subtree._meta?.negated) {
        // Extract the original predicates (without negation)
        const subChildIds = (subtree as any).getChildrenNodeIdsOf(
          (subtree as any).rootNodeId
        );
        if (subChildIds && subChildIds.length > 0) {
          const originalPredicates = subChildIds
            .map((subChildId: string) => {
              const subContent = (subtree as any).getChildContentAt(
                subChildId
              ) as PredicateContent;
              if (subContent && subContent.subject && subContent.operator) {
                let opStr;
                switch (subContent.operator) {
                  case "$eq":
                    opStr = "=";
                    break;
                  case "$gt":
                    opStr = ">";
                    break;
                  case "$lt":
                    opStr = "<";
                    break;
                  case "$gte":
                    opStr = ">=";
                    break;
                  case "$lte":
                    opStr = "<=";
                    break;
                  case "$ne":
                    opStr = "!=";
                    break;
                  default:
                    opStr = subContent.operator;
                }

                const valueStr =
                  typeof subContent.value === "string"
                    ? `'${subContent.value}'`
                    : subContent.value;

                return `${subContent.subject} ${opStr} ${valueStr}`;
              }
              return "";
            })
            .filter((str: string) => str !== "");

          if (originalPredicates.length > 0) {
            // Join with appropriate SQL operator and apply NOT
            const joinOp =
              (subtree as any).getChildContentAt((subtree as any).rootNodeId)
                .operator === "$and"
                ? "OR"
                : "AND";
            return `NOT (${originalPredicates.join(` ${joinOp} `)})`;
          }
        }
      }
      return ""; // Default case if no specific handling
    }
    return "";
  }
  // Check if this is a leaf node (simple predicate)
  else if (tree.isLeaf(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.subject && nodeContent.operator) {
      let opStr;
      switch (nodeContent.operator) {
        case "$eq":
          opStr = "=";
          break;
        case "$gt":
          opStr = ">";
          break;
        case "$lt":
          opStr = "<";
          break;
        case "$gte":
          opStr = ">=";
          break;
        case "$lte":
          opStr = "<=";
          break;
        case "$ne":
          opStr = "!=";
          break;
        default:
          opStr = nodeContent.operator;
      }

      const valueStr =
        typeof nodeContent.value === "string"
          ? `'${nodeContent.value}'`
          : nodeContent.value;

      return `${nodeContent.subject} ${opStr} ${valueStr}`;
    }
    return ""; // Empty leaf
  }
  // Must be a branch node (junction)
  else if (tree.isBranch(nodeId)) {
    const nodeContent = tree.getChildContentAt(nodeId) as PredicateContent;
    if (nodeContent && nodeContent.operator) {
      const op = nodeContent.operator === "$and" ? "AND" : "OR";

      // Get all children INCLUDING subtrees
      const childIds = tree.getChildrenNodeIdsOf(nodeId, true);
      if (childIds.length === 0) {
        return ""; // No children
      }

      // Process each child recursively
      const childStrings = childIds
        .map((childId) => createSQLRepresentationWithNOT(tree, childId))
        .filter((str) => str !== "");

      if (childStrings.length === 0) {
        return ""; // No valid children
      }

      // Join with appropriate operator and parentheses
      return childStrings.length === 1
        ? childStrings[0]
        : `(${childStrings.join(` ${op} `)})`;
    }
  }

  return ""; // Fallback for unexpected node type
}

/**
 * Generate a SQL representation of the tree with negation on individual predicates
 */
function createSQLRepresentationWithNegation(
  tree: LogicExpressionTree,
  nodeId = tree.rootNodeId
): string {
  return createFullTreeRepresentation(tree, {}, nodeId);
}

/**
 * Main function that runs the NotTree subtree example
 */
export function runPredicateTreeWithNotSubtreeExample() {
  // Build trees and attach subtree first (technical setup)
  const notTree = buildNotTree();
  const logicTree = buildLogicExpressionTree();

  // Attach the NotTree as a subtree - using local variable to avoid console output
  const subtreeNodeId = logicTree.attachSubtree(logicTree.rootNodeId, notTree);

  // Test subtree transportability (more technical setup)
  //demonstrateSubtreeTransportability();

  // Now display the interesting output
  // Export the tree to POJO and display it first
  console.log("\n=== Combined Tree Structure (POJO) ===");
  const combinedPojo = logicTree.exportWithSubtrees();

  // Display subject dictionary (only once)
  console.log("\n=== Subject Dictionary ===");
  console.log(
    "Our example uses a simple subject dictionary with three fields:"
  );
  for (const [subject, info] of Object.entries(simpleSubjectDictionary)) {
    console.log(`- ${subject} (${info.dataType}): ${info.description}`);
  }

  // Run smoke tests
  const allTestsPassed = smokeTest(
    notTree,
    logicTree,
    subtreeNodeId,
    combinedPojo
  );

  // Generate different representations instead of hardcoding them
  const humanReadableStr = createFullTreeRepresentation(
    logicTree,
    combinedPojo
  );
  const jsExpressionStr = createJSRepresentation(logicTree);
  const sqlExpressionWithNOT = createSQLRepresentationWithNOT(logicTree);
  const sqlExpressionWithNegation =
    createSQLRepresentationWithNegation(logicTree);

  console.log(`
=== Output Formats ===
JS: ${jsExpressionStr}

SQL: ${sqlExpressionWithNOT}

SQL: ${sqlExpressionWithNegation}

* Notice that in SQL there is a NOT function but in JavaScript there is not. 
  Using NOT trees allows us to get the whole expression in original form or reformat it 
  as necessary depending on the use-case.

=== Expression Format Comparison ===
The examples above demonstrate different ways to represent the same logical structure:
1. Human-Readable: Uses natural language-like formatting
2. JavaScript: Uses JavaScript syntax with && and || operators
3. SQL with NOT: Applies NOT to entire expressions/subqueries
4. SQL with individual negation: Applies negation to individual predicates

These different representations show how the same logical structure can be
expressed differently based on the target language or system requirements.

===============================================
${
  allTestsPassed
    ? "  EXAMPLE COMPLETED SUCCESSFULLY"
    : "  EXAMPLE COMPLETED WITH VALIDATION ERRORS"
}
===============================================
END OF EXAMPLE`);
}
