# Predicate Tree Library Documentation

Welcome to the Predicate Tree Library documentation. This library provides a flexible and powerful implementation of expression trees for building predicate logic systems.

## Getting Started

To install the library:

```bash
npm install predicate-tree-advanced-poc
```

## Key Concepts

The library is built around the following core concepts:

- **Expression Trees**: Hierarchical structures for representing logical expressions
- **Predicates**: Statements that can be evaluated as true or false
- **Nodes**: Individual elements in the tree that contain predicates or operators
- **POJO**: Plain Old JavaScript Objects used for serialization and deserialization

## Using the SafeAPI

To avoid TypeScript inheritance issues, use the `SafeAPI` namespace provided by the library:

```typescript
import { SafeAPI } from "predicate-tree-advanced-poc";

// Create a tree from a POJO
const treePojo = {
  "root-1": {
    parentId: null,
    nodeContent: { operator: "$and" },
  },
  "node-1": {
    parentId: "root-1",
    nodeContent: {
      subject: "customer.age",
      operator: "greaterThan",
      value: 21,
    },
  },
};

// Create a tree using the safe API
const tree = SafeAPI.createGenericTree(treePojo);

// Later, convert back to POJO for serialization
const serializedTree = treeToPojo(tree);
```

## Important Classes

- `AbstractExpressionTree`: Base class for all expression trees
- `GenericExpressionTree`: A flexible implementation for general-purpose use
- `AbstractTree`: Provides core tree functionality

## Type-Safe Helper Functions

The library provides several helper functions to work around TypeScript inheritance limitations:

- `cloneTree()`: Clone an entire tree
- `cloneTreeFrom()`: Clone a subtree
- `reRootTree()`: Create a new tree with a different root
- `treeToPojo()`: Convert a tree to a POJO
- `treeToPojoAt()`: Convert a subtree to a POJO

## Example Usage

Here's a complete example:

```typescript
import {
  GenericExpressionTree,
  SafeAPI,
  treeToPojo,
} from "predicate-tree-advanced-poc";

// Create a tree
const tree = new GenericExpressionTree();

// Add a predicate
tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.name",
  operator: "contains",
  value: "Smith",
});

// Convert to POJO
const pojo = treeToPojo(tree);

// Create a new tree from the POJO
const clonedTree = SafeAPI.createGenericTree(pojo);
```

## Additional Resources

- [GitHub Repository](https://github.com/terary/gabby-query-protocol-lib)
- [Example Usage](https://github.com/terary/gabby-query-protocol-lib/tree/main/example-usage)
