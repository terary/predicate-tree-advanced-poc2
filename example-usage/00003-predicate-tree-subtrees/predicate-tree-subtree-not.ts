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

/**
 * Build a simple Logic Expression Tree (outer tree)
 */
function buildLogicExpressionTree(): LogicExpressionTree {
  console.log("\n=== Building Outer Logic Expression Tree ===");

  // Create a new logic expression tree
  const logicTree = new LogicExpressionTree();
  console.log("✅ Created Logic Expression Tree with $and root");

  // Add some predicates
  logicTree.appendChildNodeWithContent(logicTree.rootNodeId, {
    subject: "A",
    operator: "$eq",
    value: "example",
  });
  console.log("✅ Added predicate: A equals 'example'");

  logicTree.appendChildNodeWithContent(logicTree.rootNodeId, {
    subject: "B",
    operator: "$gt",
    value: 10,
  });
  console.log("✅ Added predicate: B greater than 10");

  return logicTree;
}

/**
 * Build a Not Tree (inner tree for negation)
 */
function buildNotTree(): NotTree {
  console.log("\n=== Building Inner Not Tree (Subtree) ===");

  // Create a not tree
  const notTree = new NotTree();
  console.log("✅ Created Not Tree with negated $and root");

  // Add some predicates to negate
  notTree.appendChildNodeWithContent(notTree.rootNodeId, {
    subject: "C",
    operator: "$eq",
    value: true,
  });
  console.log(
    "✅ Added negated predicate: C equals true (will be negated to C not equals true)"
  );

  notTree.appendChildNodeWithContent(notTree.rootNodeId, {
    subject: "A",
    operator: "$eq",
    value: "test",
  });
  console.log(
    "✅ Added negated predicate: A equals 'test' (will be negated to A not equals 'test')"
  );

  return notTree;
}

/**
 * Validate the expected structure of our combined tree
 */
function validateCombinedTree(tree: LogicExpressionTree): boolean {
  console.log("\n=== Validating Combined Tree Structure ===");

  // First, check root node content
  const rootContent = tree.getChildContentAt(
    tree.rootNodeId
  ) as PredicateContent;
  if (rootContent?.operator !== "$and") {
    console.error("❌ Root node does not have $and operator");
    return false;
  }
  console.log("✅ Verified root node has $and operator");

  // Get all child nodes of root
  const childNodeIds = tree.getChildrenNodeIdsOf(tree.rootNodeId);
  console.log(`✅ Root node has ${childNodeIds.length} direct children`);

  // Check that we have the expected predicates
  let hasPredicateA = false;
  let hasPredicateB = false;
  let hasNotSubtree = false;

  // Examine each child node
  for (const childId of childNodeIds) {
    const childContent = tree.getChildContentAt(childId) as PredicateContent;

    // Check for A = 'example' predicate
    if (
      childContent?.subject === "A" &&
      childContent?.operator === "$eq" &&
      childContent?.value === "example"
    ) {
      hasPredicateA = true;
      console.log("✅ Found predicate: A = 'example'");
    }

    // Check for B > 10 predicate
    else if (
      childContent?.subject === "B" &&
      childContent?.operator === "$gt" &&
      childContent?.value === 10
    ) {
      hasPredicateB = true;
      console.log("✅ Found predicate: B > 10");
    }

    // Check for NOT subtree (AND with negated flag)
    else if (
      childContent?.operator === "$and" &&
      childContent?._meta?.negated === true
    ) {
      hasNotSubtree = true;

      // Verify this is indeed a subtree by checking for its children
      const subChildIds = tree.getChildrenNodeIdsOf(childId);

      // Check if it has the expected negated predicates
      let hasNegatedC = false;
      let hasNegatedA = false;

      for (const subChildId of subChildIds) {
        const subContent = tree.getChildContentAt(
          subChildId
        ) as PredicateContent;

        if (
          subContent?.subject === "C" &&
          subContent?.operator === "$eq" &&
          subContent?.value === true &&
          subContent?._meta?.negated === true
        ) {
          hasNegatedC = true;
        }

        if (
          subContent?.subject === "A" &&
          subContent?.operator === "$eq" &&
          subContent?.value === "test" &&
          subContent?._meta?.negated === true
        ) {
          hasNegatedA = true;
        }
      }

      if (hasNegatedC && hasNegatedA) {
        console.log(`✅ Found NOT subtree with negated predicates C and A`);
      } else {
        console.error(
          "❌ NOT subtree doesn't have the expected negated predicates"
        );
        return false;
      }
    }
  }

  // Verify we found all expected components
  if (!hasPredicateA) {
    console.error("❌ Missing predicate A = 'example'");
    return false;
  }

  if (!hasPredicateB) {
    console.error("❌ Missing predicate B > 10");
    return false;
  }

  if (!hasNotSubtree) {
    console.error("❌ Missing NOT subtree");
    return false;
  }

  console.log(
    "\n✅ VALIDATION SUCCESSFUL: Tree contains all expected components"
  );
  return true;
}

/**
 * Display information about our subject dictionary
 */
function displaySubjectDictionary() {
  console.log("\n=== Subject Dictionary ===");
  console.log(
    "Our example uses a simple subject dictionary with three fields:"
  );

  for (const [subject, info] of Object.entries(simpleSubjectDictionary)) {
    console.log(`- ${subject} (${info.dataType}): ${info.description}`);
  }
}

/**
 * Demonstrate that a NotTree can be transported between trees
 */
function demonstrateSubtreeTransportability() {
  console.log("\n=== Testing Subtree Transportability ===");

  // Create a NotTree
  const notTree = new NotTree();
  notTree.appendChildNodeWithContent(notTree.rootNodeId, {
    subject: "A",
    operator: "$eq",
    value: "transportable",
  });
  console.log("✅ Created a Not Tree with one predicate");

  // Export it to POJO
  const notTreePojo = notTree.toPojoAt(notTree.rootNodeId);
  console.log("✅ Exported Not Tree to POJO");

  // Create first logic tree and attach subtree
  const logicTree1 = new LogicExpressionTree();
  const subtreeNodeId1 = logicTree1.attachSubtree(
    logicTree1.rootNodeId,
    notTree
  );
  console.log("✅ Attached Not Tree as subtree to first Logic Tree");

  // Create second logic tree and attach the same subtree
  const logicTree2 = new LogicExpressionTree();
  const subtreeNodeId2 = logicTree2.attachSubtree(
    logicTree2.rootNodeId,
    notTree
  );
  console.log("✅ Attached Not Tree as subtree to second Logic Tree");

  console.log("✅ Successfully demonstrated subtree transportability");
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
  console.log(
    notTreeString === expectedNotTree
      ? "✅ NotTree matches hardcoded structure"
      : "❌ NotTree does not match hardcoded structure"
  );

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
}
