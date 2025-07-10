# Predicate Tree with Subtrees Example (00003a-predicate-tree-subtrees)

This example demonstrates how to work with subtrees in the Predicate Tree library, allowing you to create nested hierarchical structures.

## What This Example Demonstrates

- Creating subtrees within a main tree
- Understanding the tree-subtree relationship
- Manipulating subtree structures
- Traversing trees with nested structures

## Key Concepts Covered

### Creating Subtrees

```typescript
import {
  GenericExpressionTree,
  createSubtree,
} from "predicate-tree-advanced-poc";

// Create a main tree
const mainTree = new GenericExpressionTree();
mainTree.replaceNodeContent(mainTree.rootNodeId, { operator: "$and" });

// Add a simple predicate to the main tree
mainTree.appendChildNodeWithContent(mainTree.rootNodeId, {
  subject: "customer.status",
  operator: "equals",
  value: "active",
});

// Create a subtree attached to the main tree
const subtree = createSubtree(mainTree, mainTree.rootNodeId);

// Configure the subtree
subtree.replaceNodeContent(subtree.rootNodeId, { operator: "$or" });
```

### Adding Content to Subtrees

```typescript
// Add predicates to the subtree
subtree.appendChildNodeWithContent(subtree.rootNodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "North America",
});

subtree.appendChildNodeWithContent(subtree.rootNodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "Europe",
});
```

### Subtree Structure Visualization

The resulting tree structure looks like:

```
AND (root)
├── customer.status equals "active"
└── OR (subtree)
    ├── customer.region equals "North America"
    └── customer.region equals "Europe"
```

### Traversing Trees with Subtrees

```typescript
// Recursive function to traverse a tree with subtrees
function traverseTree(tree, nodeId, depth = 0) {
  const content = tree.getNodeContent(nodeId);
  const indent = "  ".repeat(depth);

  console.log(`${indent}Node: ${nodeId}`);
  console.log(`${indent}Content:`, content);

  // Check if this node is a subtree
  if (tree.isSubtree(nodeId)) {
    const subtree = tree.getSubtreeAt(nodeId);
    console.log(`${indent}This is a subtree with root: ${subtree.rootNodeId}`);

    // Traverse the subtree
    traverseTree(subtree, subtree.rootNodeId, depth + 1);
  }

  // Traverse child nodes
  const childNodeIds = tree.getChildNodeIds(nodeId);
  childNodeIds.forEach((childId) => {
    traverseTree(tree, childId, depth + 1);
  });
}
```

## Running This Example

```bash
# Navigate to the example directory
cd 00003a-predicate-tree-subtrees

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. How to create and use subtrees within a main tree
2. How subtrees maintain their own structure while being part of a parent tree
3. How to traverse complex tree structures with nested subtrees
4. Best practices for working with hierarchical predicate structures

Subtrees are a powerful feature for representing complex nested logical expressions, particularly useful for advanced query builders and rule engines.
