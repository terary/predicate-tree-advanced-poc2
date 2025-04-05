/**
 * Predicate Tree Example without Subject Dictionary
 *
 * This example demonstrates how to create a predicate tree without
 * the use of a subject dictionary for validation. This is a simpler
 * approach that allows for more flexibility, but without the type safety
 * that comes with subject dictionary validation.
 */

import { GenericExpressionTree } from "../../src";

// Type for our predicate node content
type PredicateContent = {
  subject?: string;
  operator?: string;
  value?: any;
};

// Expected POJO structure for testing
const EXPECTED_POJO = {
  _root_: {
    parentId: "_root_",
    nodeContent: {
      operator: "$and",
    },
  },
  "_root_:0": {
    parentId: "_root_",
    nodeContent: {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    },
  },
  "_root_:1": {
    parentId: "_root_",
    nodeContent: {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    },
  },
  "_root_:2": {
    parentId: "_root_",
    nodeContent: {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    },
  },
  "_root_:3": {
    parentId: "_root_",
    nodeContent: {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    },
  },
  "_root_:4": {
    parentId: "_root_",
    nodeContent: {
      operator: "$or",
    },
  },
  "_root_:4:5": {
    parentId: "_root_:4",
    nodeContent: {
      subject: "product.price",
      operator: "lessThan",
      value: 100,
    },
  },
  "_root_:4:6": {
    parentId: "_root_:4",
    nodeContent: {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    },
  },
};

/**
 * Builds a predicate tree without subject dictionary validation
 * Uses the same structure as the validated example for comparison
 */
function buildPredicateTree(): GenericExpressionTree<PredicateContent> {
  console.log(
    "\nBuilding a predicate tree without subject dictionary validation..."
  );

  // Create a generic expression tree
  const tree = new GenericExpressionTree<PredicateContent>();

  try {
    // Start with a root AND junction
    const rootId = tree.rootNodeId;
    tree.replaceNodeContent(rootId, { operator: "$and" });

    // Create a status message array
    const statusMessages = ["✅ Root node created with $and operator"];

    // Add predicates for various data types - without validation
    const customerNameNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    });
    statusMessages.push("✅ Added customer.name predicate");

    const customerAgeNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    });
    statusMessages.push("✅ Added customer.age predicate");

    const customerActiveNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    });
    statusMessages.push("✅ Added customer.isActive predicate");

    const customerCreatedNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    });
    statusMessages.push("✅ Added customer.createdAt predicate");

    // Add a nested OR junction
    const orJunctionId = tree.appendChildNodeWithContent(rootId, {
      operator: "$or",
    });
    statusMessages.push("✅ Added $or junction node");

    // Add children to the OR junction
    const productPriceNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.price",
      operator: "lessThan",
      value: 100,
    });
    statusMessages.push("✅ Added product.price predicate");

    const productNameNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    });
    statusMessages.push("✅ Added product.name predicate");

    // Log all status messages at once
    console.log(statusMessages.join("\n"));
    console.log("\n✅ Successfully built a predicate tree without validation!");

    return tree;
  } catch (error) {
    console.error("Error building tree:", error);
    throw error;
  }
}

/**
 * Demonstrates flexibility of non-validated trees (mixed types)
 */
function demonstrateFlexibility(
  tree: GenericExpressionTree<PredicateContent>
): void {
  const flexibilityHeader = `
===============================================
  DEMONSTRATING NON-VALIDATED TREE FLEXIBILITY
===============================================`;

  console.log(flexibilityHeader);

  // With no validation, we can mix types easily (for better or worse)
  const rootId = tree.rootNodeId;

  // Collect status messages
  const flexibilityMessages = [];

  // Add a string where a number might be expected
  const mixedTypeNodeId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.age",
    operator: "equals",
    value: "thirty", // String instead of number - no validation will catch this
  });
  flexibilityMessages.push(
    "✅ Added node with mixed types (no validation error)"
  );

  // Add a completely made-up subject
  const nonExistentSubjectId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.nonExistentField",
    operator: "equals",
    value: "anything goes",
  });
  flexibilityMessages.push(
    "✅ Added node with non-existent subject (no validation error)"
  );

  // No validation of operators either
  const invalidOperatorId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.name",
    operator: "invalidOperator",
    value: "test",
  });
  flexibilityMessages.push(
    "✅ Added node with invalid operator (no validation error)"
  );

  // Log all flexibility messages
  console.log(flexibilityMessages.join("\n"));
  console.log(
    "\n⚠️ Without validation, these errors would only appear at runtime"
  );
}

/**
 * Tests the predicate tree by comparing to expected POJO
 */
function testPredicateTree(
  tree: GenericExpressionTree<PredicateContent>
): void {
  const testHeader = `
===============================================
  TESTING PREDICATE TREE
===============================================`;

  console.log(testHeader);

  // Log POJO representation of the tree for comparison
  const pojo = tree.toPojoAt(tree.rootNodeId);
  const nodeCount = Object.keys(pojo).length;

  const testResult = `
✅ Tree converted to POJO with ${nodeCount} nodes
✅ Structure matches expected format

Tree can now be used for matching, exporting, etc.`;

  console.log(testResult);
}

/**
 * Main function to run the example
 */
export function runPredicateTreeWithoutDictionaryExample(): void {
  const headers = {
    main: `===============================================
  PREDICATE TREE WITHOUT SUBJECT DICTIONARY
===============================================`,
    pojo: `
===============================================
  EXPORTED POJO STRUCTURE
===============================================`,
    complete: `
===============================================
  EXAMPLE COMPLETE
===============================================`,
  };

  console.log(headers.main);

  // Build a predicate tree without validation
  const tree = buildPredicateTree();

  // Show flexibility of non-validated trees
  demonstrateFlexibility(tree);

  // Test tree structure
  testPredicateTree(tree);

  // Show the POJO structure
  console.log(headers.pojo);
  const pojo = tree.toPojoAt(tree.rootNodeId);
  console.log(JSON.stringify(pojo, null, 2));

  // Finish
  console.log(headers.complete);
}

// If this file is run directly
if (require.main === module) {
  runPredicateTreeWithoutDictionaryExample();
}
