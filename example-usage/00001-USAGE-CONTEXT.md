# Simple Predicate Tree Example (00001-simple-predicate-tree)

This example demonstrates the basic usage of the Predicate Tree library for creating and working with simple expression trees.

## What This Example Demonstrates

- Creating a basic predicate tree
- Adding nodes with different predicates
- Traversing the tree structure
- Basic tree operations

## Key Concepts Covered

### Basic Tree Creation

```typescript
// Create a new expression tree
const tree = new GenericExpressionTree();

// The root node is created automatically
console.log(`Root node ID: ${tree.rootNodeId}`);
```

### Adding Junction Nodes (AND/OR)

```typescript
// Set the root node as an AND junction
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });
```

### Adding Predicate Nodes

```typescript
// Add a child node with a simple predicate
const childId = tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.name",
  operator: "contains",
  value: "Smith",
});
```

### Traversing the Tree

```typescript
// Get all child IDs of the root node
const childIds = tree.getChildNodeIds(tree.rootNodeId);

// Iterate through children
childIds.forEach((id) => {
  const content = tree.getNodeContent(id);
  console.log(`Node ${id} content:`, content);
});
```

## Running This Example

```bash
# Navigate to the example directory
cd 00001-simple-predicate-tree

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. How to create a basic predicate tree
2. How to add and manipulate nodes
3. The structure of a predicate expression
4. How to traverse a tree to access its nodes

This example forms the foundation for more advanced usage patterns demonstrated in other examples.
