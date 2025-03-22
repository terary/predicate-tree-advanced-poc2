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

    console.log("✅ Root node created with $and operator");

    // Add predicates for various data types - without validation
    const customerNameNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    });
    console.log("✅ Added customer.name predicate");

    const customerAgeNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    });
    console.log("✅ Added customer.age predicate");

    const customerActiveNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    });
    console.log("✅ Added customer.isActive predicate");

    const customerCreatedNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    });
    console.log("✅ Added customer.createdAt predicate");

    // Add a nested OR junction
    const orJunctionId = tree.appendChildNodeWithContent(rootId, {
      operator: "$or",
    });
    console.log("✅ Added $or junction node");

    // Add children to the OR junction
    const productPriceNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.price",
      operator: "lessThan",
      value: 100,
    });
    console.log("✅ Added product.price predicate");

    const productNameNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    });
    console.log("✅ Added product.name predicate");

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
  console.log("\n===============================================");
  console.log("  DEMONSTRATING NON-VALIDATED TREE FLEXIBILITY");
  console.log("===============================================");

  // With no validation, we can mix types easily (for better or worse)
  const rootId = tree.rootNodeId;

  // Add a string where a number might be expected
  const mixedTypeNodeId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.age",
    operator: "equals",
    value: "thirty", // String instead of number - no validation will catch this
  });
  console.log("✅ Added node with mixed types (no validation error)");

  // Add a completely made-up subject
  const nonExistentSubjectId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.nonExistentField",
    operator: "equals",
    value: "anything goes",
  });
  console.log("✅ Added node with non-existent subject (no validation error)");

  // No validation of operators either
  const invalidOperatorId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.name",
    operator: "invalidOperator",
    value: "test",
  });
  console.log("✅ Added node with invalid operator (no validation error)");

  console.log(
    "\n⚠️ Without validation, these errors would only appear at runtime"
  );

  // Remove the test nodes to restore the original structure
  tree.removeNodeAt(mixedTypeNodeId);
  tree.removeNodeAt(nonExistentSubjectId);
  tree.removeNodeAt(invalidOperatorId);

  console.log("✅ Removed test nodes to restore original structure");
}

/**
 * Tests the predicate tree against the expected structure
 */
function testPredicateTree(
  tree: GenericExpressionTree<PredicateContent>
): void {
  console.log("\n===============================================");
  console.log("  TESTING PREDICATE TREE STRUCTURE");
  console.log("===============================================");

  // Get the actual POJO
  const actualPojo = tree.toPojoAt(tree.rootNodeId);

  // Convert both to strings for comparison
  const actualStr = JSON.stringify(actualPojo);
  const expectedStr = JSON.stringify(EXPECTED_POJO);

  // Compare the actual and expected structures
  if (actualStr === expectedStr) {
    console.log("✅ TEST PASSED: Tree structure matches expected POJO");
  } else {
    console.log("❌ TEST FAILED: Tree structure does not match expected POJO");
    console.log("\nExpected structure:");
    console.log(expectedStr);
    console.log("\nActual structure:");
    console.log(actualStr);
  }
}

/**
 * Runs the full predicate tree without subject dictionary example
 */
export function runPredicateTreeWithoutDictionaryExample(): void {
  console.log("===============================================");
  console.log("  PREDICATE TREE WITHOUT SUBJECT DICTIONARY");
  console.log("===============================================");

  // Build a predicate tree without validation
  const tree = buildPredicateTree();

  // Show the POJO structure
  console.log("\n===============================================");
  console.log("  EXPORTED POJO STRUCTURE");
  console.log("===============================================");

  const pojo = tree.toPojoAt(tree.rootNodeId);
  console.log(JSON.stringify(pojo, null, 2));

  // Demonstrate flexibility (potential pitfalls)
  demonstrateFlexibility(tree);

  // Test the tree against expected structure
  testPredicateTree(tree);

  console.log("\n===============================================");
  console.log("  EXAMPLE COMPLETE");
  console.log("===============================================");
}

// If this file is run directly
if (require.main === module) {
  runPredicateTreeWithoutDictionaryExample();
}
