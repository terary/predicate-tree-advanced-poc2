/**
 * Simple Predicate Tree Example
 *
 * This example demonstrates:
 * 1. Creating a tree and importing data from a POJO
 * 2. Exporting the tree as a POJO
 * 3. Validating the output
 *
 * Note: This example doesn't require a subject dictionary because:
 * 1. GenericExpressionTree has no built-in validation - it accepts any content objects for nodes
 * 2. The tree itself doesn't validate predicates against data types or field existence
 * 3. Validation happens separately from tree construction, for `GenericExpressionTree`
 *
 * This design approach is used only for this example to focus on demonstrating the basic
 * tree structure operations without the additional complexity of validation logic.
 */

import { GenericExpressionTree } from "./imports";

// Function to pretty print a POJO
function prettyPrint(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

console.log("=== Simple Predicate Tree Example ===\n");

// 1. Create a simple predicate tree
console.log("1. Creating tree and importing POJO structure");

// Create a new tree instance
const tree = new GenericExpressionTree();

// Initialize the tree with the POJO structure
// For demo purposes, manually build a small part of the structure
tree.replaceNodeContent(tree.rootNodeId, { operator: "$or" });

// Add first condition branch (AND)
const branch1Id = tree.appendChildNodeWithContent(tree.rootNodeId, {
  operator: "$and",
});

// Add second condition branch (AND)
const branch2Id = tree.appendChildNodeWithContent(tree.rootNodeId, {
  operator: "$and",
});

// Add conditions to first branch
tree.appendChildNodeWithContent(branch1Id, {
  subject: "person.firstname",
  operator: "$eq",
  value: "John",
});

tree.appendChildNodeWithContent(branch1Id, {
  subject: "person.age",
  operator: "$gte",
  value: 18,
});

console.log(`Tree created with root ID: ${tree.rootNodeId}`);

// 2. Export the tree as a POJO
console.log("\n2. Exporting tree as POJO");
const treePojo = tree.toPojoAt();
console.log("Tree POJO:");
console.log(prettyPrint(treePojo));

// 3. Validate the output structure
console.log("\n3. Validating output");

// Check if the root node has the correct operator
// Use type assertion to access the operator property
const rootOperator = (treePojo._root_?.nodeContent as any)?.operator;
console.log(`Root node operator: ${rootOperator}`);
console.log(`Root operator is "$or": ${rootOperator === "$or" ? "YES" : "NO"}`);

// Count number of nodes
const nodeCount = Object.keys(treePojo).length;
console.log(`Tree has ${nodeCount} nodes`);

console.log("\n=== Example Complete ===");
