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
  const validationHeader = `
===============================================
  DEMONSTRATING VALIDATION ERRORS
===============================================`;

  console.log(validationHeader);

  const tree = new ValidatedPredicateTree(customerProductDictionary);
  const rootId = tree.getRootNodeId();
  tree.replaceNodeContent(rootId, { operator: "$and" });

  console.log("\n❌ Testing invalid predicates (expected to fail):");

  // Try 1: Invalid subject (not in dictionary)
  try {
    const test1Message = "\nTest 1: Using subject not defined in dictionary";
    console.log(test1Message);
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
    const test2Message = "\nTest 2: Using number value for string field";
    console.log(test2Message);
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
    const test3Message = "\nTest 3: Using string value for number field";
    console.log(test3Message);
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
    const test4Message = "\nTest 4: Using string value for boolean field";
    console.log(test4Message);
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
    const test5Message = "\nTest 5: Using invalid date format";
    console.log(test5Message);
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
  const buildingHeader = `
===============================================
  BUILDING A PREDICATE TREE WITH VALIDATION
===============================================

Creating a predicate tree with subject dictionary validation...`;

  console.log(buildingHeader);

  // Create a validated predicate tree with our subject dictionary
  const tree = new ValidatedPredicateTree(customerProductDictionary);

  try {
    // Start with a root AND junction
    const rootId = tree.getRootNodeId();
    tree.replaceNodeContent(rootId, { operator: "$and" });

    // We'll collect status messages instead of logging each one separately
    const statusMessages = [];
    statusMessages.push("✅ Root node created with $and operator");

    // Add valid predicates for various data types
    const customerNameNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.name",
      operator: "contains",
      value: "Smith",
    });
    statusMessages.push("✅ Added valid customer.name predicate");

    const customerAgeNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.age",
      operator: "greaterThan",
      value: 30,
    });
    statusMessages.push("✅ Added valid customer.age predicate");

    const customerActiveNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.isActive",
      operator: "equals",
      value: true,
    });
    statusMessages.push("✅ Added valid customer.isActive predicate");

    const customerCreatedNodeId = tree.appendChildNodeWithContent(rootId, {
      subject: "customer.createdAt",
      operator: "after",
      value: "2023-01-01",
    });
    statusMessages.push("✅ Added valid customer.createdAt predicate");

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
    statusMessages.push("✅ Added valid product.price predicate");

    const productNameNodeId = tree.appendChildNodeWithContent(orJunctionId, {
      subject: "product.name",
      operator: "startsWith",
      value: "Premium",
    });
    statusMessages.push("✅ Added valid product.name predicate");

    // Log all status messages at once
    console.log(statusMessages.join("\n"));
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
  // Demonstrate validation errors first
  demonstrateValidationErrors();

  // Then build a valid tree
  demonstrateTreeBuilding();

  // Export as POJO
  const tree = buildTreeSilently();

  if (tree) {
    const footerMessages = `
===============================================
  PREDICATE TREE WITH SUBJECT DICTIONARY
===============================================

===============================================
  EXPORTED POJO STRUCTURE
===============================================`;

    console.log(footerMessages);

    const pojo = tree.toPojoAt(tree.getRootNodeId());
    console.log(JSON.stringify(pojo, null, 2));

    const completionMessage = `
===============================================
  EXAMPLE COMPLETE
===============================================`;

    console.log(completionMessage);
  }
}
