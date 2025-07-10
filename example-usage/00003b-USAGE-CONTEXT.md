# Predicate Tree Subtrees with Object Identity (00003b-predicate-tree-subtrees-object-identity)

This example demonstrates how object identity works when dealing with subtrees in the Predicate Tree library, highlighting how changes propagate between trees and subtrees.

## What This Example Demonstrates

- Object identity between parent trees and subtrees
- How changes in a subtree automatically reflect in the parent tree
- Reference vs. clone behavior with subtrees
- Best practices for maintaining tree integrity

## Key Concepts Covered

### Object Identity with Subtrees

```typescript
import {
  GenericExpressionTree,
  createSubtree,
} from "predicate-tree-advanced-poc";

// Create a main tree
const mainTree = new GenericExpressionTree();
mainTree.replaceNodeContent(mainTree.rootNodeId, { operator: "$and" });

// Create a subtree
const subtree = createSubtree(mainTree, mainTree.rootNodeId);
subtree.replaceNodeContent(subtree.rootNodeId, { operator: "$or" });

// Add a node to the subtree
const nodeId = subtree.appendChildNodeWithContent(subtree.rootNodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "North America",
});

// This change in the subtree is reflected in the main tree
console.log(
  "Main tree has the subtree's nodes:",
  mainTree.getAllNodeIds().includes(nodeId)
); // Will print true
```

### Modifications Propagate Automatically

```typescript
// Modifying content in the subtree
subtree.replaceNodeContent(nodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "Europe", // Changed from "North America"
});

// The change is reflected in the main tree
const contentFromMain = mainTree.getNodeContent(nodeId);
console.log(contentFromMain.value); // Will print "Europe"
```

### Cloning vs. References

```typescript
import { cloneTree } from "predicate-tree-advanced-poc";

// Create a clone of the main tree
const clonedTree = cloneTree(mainTree);

// Modify something in the original subtree
subtree.replaceNodeContent(nodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "Asia", // Changed again
});

// The cloned tree doesn't see this change
const clonedContent = clonedTree.getNodeContent(nodeId);
console.log(clonedContent.value); // Still "Europe", not "Asia"

// Get the subtree from the clone
const clonedSubtree = createSubtree(clonedTree, clonedTree.rootNodeId);

// Modify the cloned subtree
clonedSubtree.replaceNodeContent(nodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "Australia", // Changed in the clone
});

// The original tree doesn't see this change
const originalContent = mainTree.getNodeContent(nodeId);
console.log(originalContent.value); // Still "Asia", not "Australia"
```

### Maintaining Object Identity with POJO Serialization

```typescript
import { treeToPojo, SafeAPI } from "predicate-tree-advanced-poc";

// Convert to POJO
const pojo = treeToPojo(mainTree);

// Create a new tree from the POJO
const restoredTree = SafeAPI.createGenericTree(pojo);

// Now the restored tree is a completely separate object
// with no shared identity with the original
```

## Running This Example

```bash
# Navigate to the example directory
cd 00003b-predicate-tree-subtrees-object-identity

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. How object identity works with subtrees in the Predicate Tree library
2. How changes propagate between parent trees and their subtrees
3. The difference between references and clones when working with trees
4. How to maintain object integrity when manipulating complex tree structures
5. Best practices for serializing and deserializing trees with subtrees

Understanding object identity is crucial for correctly implementing and maintaining complex tree structures in applications, especially when trees need to be modified, cloned, or serialized.
