# Predicate Tree POJO Import/Export Example (00004-predicate-tree-pojo-import-export)

This example demonstrates how to serialize and deserialize predicate trees using Plain Old JavaScript Objects (POJOs), which is essential for storage, transmission, and persistence.

## What This Example Demonstrates

- Converting predicate trees to/from POJO format
- Using the SafeAPI for type-safe deserialization
- Maintaining tree structure and content through serialization
- Best practices for working with serialized trees

## Key Concepts Covered

### Serializing Trees to POJOs

```typescript
import { GenericExpressionTree, treeToPojo } from "predicate-tree-advanced-poc";

// Create a tree
const tree = new GenericExpressionTree();
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// Add some child nodes
tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.status",
  operator: "equals",
  value: "active",
});

tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.age",
  operator: "greaterThan",
  value: 30,
});

// Convert the tree to a POJO
const pojo = treeToPojo(tree);

// The POJO can now be:
// - Stored in a database
// - Sent over a network
// - Persisted to a file
console.log(JSON.stringify(pojo, null, 2));
```

### POJO Structure

The serialized POJO structure looks like:

```json
{
  "root-1": {
    "parentId": null,
    "nodeContent": { "operator": "$and" }
  },
  "node-1": {
    "parentId": "root-1",
    "nodeContent": {
      "subject": "customer.status",
      "operator": "equals",
      "value": "active"
    }
  },
  "node-2": {
    "parentId": "root-1",
    "nodeContent": {
      "subject": "customer.age",
      "operator": "greaterThan",
      "value": 30
    }
  }
}
```

### Deserializing POJOs to Trees

```typescript
import { SafeAPI } from "predicate-tree-advanced-poc";

// Later, reconstitute the tree from the POJO
const restoredTree = SafeAPI.createGenericTree(pojo);

// The restored tree functions exactly like the original
console.log("Root node ID:", restoredTree.rootNodeId);
console.log(
  "Child nodes:",
  restoredTree.getChildNodeIds(restoredTree.rootNodeId)
);
```

### Using the SafeAPI for Type Safety

```typescript
// Using SafeAPI instead of direct static methods ensures proper typing
// This may cause TypeScript errors:
// const incorrectTree = GenericExpressionTree.fromPojo(pojo);

// This works correctly:
const correctTree = SafeAPI.createGenericTree(pojo);

// You can also use it with custom content types:
interface MyCustomContent {
  subject?: string;
  operator?: string;
  value?: any;
  customField?: string;
}

const typedTree = SafeAPI.createGenericTree<MyCustomContent>(pojo);
```

### Serializing Subtrees

```typescript
import { createSubtree, treeToPojoAt } from "predicate-tree-advanced-poc";

// Create a subtree
const subtree = createSubtree(tree, tree.rootNodeId);
subtree.appendChildNodeWithContent(subtree.rootNodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "North America",
});

// Serialize just the subtree
const subtreePojo = treeToPojoAt(tree, subtree.rootNodeId);

// Later, create a standalone tree from just the subtree
const standaloneSubtree = SafeAPI.createGenericTree(subtreePojo);
```

## Running This Example

```bash
# Navigate to the example directory
cd 00004-predicate-tree-pojo-import-export

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. How to convert predicate trees to and from serializable POJO format
2. The structure of the serialized POJO representation
3. How to use the SafeAPI for type-safe deserialization
4. Best practices for handling serialized trees
5. How to serialize and deserialize subtrees

This capability is essential for applications that need to save, load, or transmit predicate trees across systems or sessions.
