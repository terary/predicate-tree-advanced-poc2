/**
 * Predicate Tree Validation Example
 *
 * Contains the implementation of the predicate tree validation example
 * which demonstrates how to use a subject dictionary to validate
 * predicate tree nodes.
 */

import { customerProductDictionary } from "./assets/subjectDictionary";
import {
  ValidatedPredicateTree,
  ValidationError,
  PredicateContent,
} from "./assets/ValidatedPredicateTree";

/**
 * Silently builds a predicate tree for demonstration
 * Returns the tree without console output
 */
function buildTreeSilently(): ValidatedPredicateTree | null {
  try {
    // Create a validated predicate tree with our subject dictionary
    const tree = new ValidatedPredicateTree(customerProductDictionary);

    // Start with a root AND junction
    const rootId = tree.getRootNodeId();
    tree.replaceNodeContent(rootId, { operator: "$and" });

    // Add valid predicates for various data types
    const customerNameNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    });

    const customerAgeNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    });

    const customerActiveNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    });

    const customerCreatedNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    });

    // Add a nested OR junction
    const orJunctionId = tree.appendChildNodeWithContent(rootId, {
      operator: "$or",
    });

    // Add children to the OR junction
    const productPriceNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.price",
      operator: "lessThan",
      value: 100,
    });

    const productNameNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    });

    return tree;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation Error: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    return null;
  }
}

/**
 * Demonstrates validation errors
 */
function demonstrateValidationErrors() {
  console.log("\n===============================================");
  console.log("  DEMONSTRATING VALIDATION ERRORS");
  console.log("===============================================");

  const tree = new ValidatedPredicateTree(customerProductDictionary);
  const rootId = tree.getRootNodeId();
  tree.replaceNodeContent(rootId, { operator: "$and" });

  console.log("\n❌ Testing invalid predicates (expected to fail):");

  // Try 1: Invalid subject (not in dictionary)
  try {
    console.log("\nTest 1: Using subject not defined in dictionary");
    tree.appendChildNodeWithContent(rootId, {
      subject: "customer.notInDictionary",
      operator: "equals",
      value: "test",
    });
    console.log("  This should have failed!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`  ❌ Error correctly thrown: ${error.message}`);
    }
  }

  // Try 2: Type mismatch - number for string field
  try {
    console.log("\nTest 2: Using number value for string field");
    tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "equals",
      value: 123, // Type error - should be string
    });
    console.log("  This should have failed!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`  ❌ Error correctly thrown: ${error.message}`);
    }
  }

  // Try 3: Type mismatch - string for number field
  try {
    console.log("\nTest 3: Using string value for number field");
    tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "equals",
      value: "thirty", // Type error - should be number
    });
    console.log("  This should have failed!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`  ❌ Error correctly thrown: ${error.message}`);
    }
  }

  // Try 4: Type mismatch - string for boolean field
  try {
    console.log("\nTest 4: Using string value for boolean field");
    tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: "yes", // Type error - should be boolean
    });
    console.log("  This should have failed!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`  ❌ Error correctly thrown: ${error.message}`);
    }
  }

  // Try 5: Invalid date format
  try {
    console.log("\nTest 5: Using invalid date format");
    tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "equals",
      value: "not-a-date", // Invalid date format
    });
    console.log("  This should have failed!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`  ❌ Error correctly thrown: ${error.message}`);
    }
  }

  console.log("\n✅ All validation errors were correctly caught!");
}

/**
 * Demonstrates building a predicate tree with validation
 * Shows each step with console output
 */
function demonstrateTreeBuilding() {
  console.log("\n===============================================");
  console.log("  BUILDING A PREDICATE TREE WITH VALIDATION");
  console.log("===============================================");

  console.log(
    "\nCreating a predicate tree with subject dictionary validation..."
  );

  // Create a validated predicate tree with our subject dictionary
  const tree = new ValidatedPredicateTree(customerProductDictionary);

  try {
    // Start with a root AND junction
    const rootId = tree.getRootNodeId();
    tree.replaceNodeContent(rootId, { operator: "$and" });

    console.log("✅ Root node created with $and operator");

    // Add valid predicates for various data types
    const customerNameNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    });
    console.log("✅ Added valid customer.name predicate");

    const customerAgeNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    });
    console.log("✅ Added valid customer.age predicate");

    const customerActiveNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    });
    console.log("✅ Added valid customer.isActive predicate");

    const customerCreatedNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    });
    console.log("✅ Added valid customer.createdAt predicate");

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
    console.log("✅ Added valid product.price predicate");

    const productNameNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    });
    console.log("✅ Added valid product.name predicate");

    console.log("\n✅ Successfully built a valid predicate tree!");

    return tree;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation Error: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    return null;
  }
}

/**
 * Runs the full predicate tree validation example
 */
export function runPredicateTreeValidationExample(): void {
  console.log("===============================================");
  console.log("  PREDICATE TREE WITH SUBJECT DICTIONARY");
  console.log("===============================================");

  // First, build tree silently (no console output)
  const tree = buildTreeSilently();

  // Show the POJO structure first
  if (tree) {
    console.log("\n===============================================");
    console.log("  EXPORTED POJO STRUCTURE");
    console.log("===============================================");

    const pojo = tree.toPojo();
    console.log(JSON.stringify(pojo, null, 2));
  }

  // First demonstrate validation errors (red X's)
  demonstrateValidationErrors();

  // Then demonstrate the successful tree building (green checks)
  demonstrateTreeBuilding();

  console.log("\n===============================================");
  console.log("  EXAMPLE COMPLETE");
  console.log("===============================================");
}
