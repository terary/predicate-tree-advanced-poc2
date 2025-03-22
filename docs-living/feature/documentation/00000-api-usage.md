# Predicate Tree Advanced API Documentation

## Introduction

Predicate Tree Advanced is a TypeScript library for building, manipulating, and evaluating predicate trees. A predicate tree is a hierarchical structure that represents logical conditions (predicates) organized in a tree format, which can be used for filtering, matching, and validating data.

This library provides a robust API for creating, manipulating, and evaluating these trees, with support for complex logical operations and nested conditions.

## Core Concepts

### Trees and Graphs

- **Directed Graph**: The foundation of the library, representing a collection of nodes with directional connections.
- **Tree**: A specialized directed graph with hierarchical relationships between nodes.
- **Expression Tree**: A tree specialized for handling logical expressions with support for junctions (AND/OR conditions).

### Node IDs and Tree Manipulation

**Important Implementation Detail**: Many methods in this library return **node IDs**, which are references to specific nodes in the tree. It's crucial to understand that:

1. **Node IDs are temporal**: They should only be used within the scope where they're created (typically within the same function body).

2. **Tree restructuring**: The tree structure will automatically reorganize nodes as necessary to accommodate adding or removing nodes. During these operations, node relationships may change.

3. **Node referential integrity**: A node ID will continue to point to the same node unless that specific node is removed. However, the **content** of the node may change as the tree adapts its structure.

4. **Avoiding stored references**: Do not store node IDs for long-term use. Always request fresh node IDs when needed in a new context.

5. **Accessing the root node**: The root node ID should **ALWAYS** be accessed via the `tree.rootNodeId` property rather than storing or hardcoding it. Even in cases where you might know the value (e.g., "_root_"), always use the property instead. This ensures your code remains resilient to any internal implementation changes.

```typescript
// CORRECT: Use the rootNodeId property
function correctRootUsage(tree) {
  // Always use tree.rootNodeId rather than hardcoding "_root_"
  const nodeId = tree.appendChildNodeWithContent(tree.rootNodeId, {
    subject: "customer.status",
    operator: "$eq",
    value: "active",
  });

  // Other operations...
}

// INCORRECT: Hardcoding or storing the root ID
function incorrectRootUsage(tree) {
  // Don't do this! This might break if implementation changes
  const rootId = "_root_";
  const nodeId = tree.appendChildNodeWithContent(rootId, {
    subject: "customer.status",
    operator: "$eq",
    value: "active",
  });
}
```

```typescript
// Example of proper node ID usage scope
function manipulateTree(tree) {
  // Get a node ID in this function scope
  const nodeId = tree.appendChildNodeWithContent(tree.rootNodeId, {
    subject: "customer.status",
    operator: "$eq",
    value: "pending",
  });

  // Use the node ID immediately within this scope
  tree.replaceNodeContent(nodeId, {
    subject: "customer.status",
    operator: "$eq",
    value: "pending",
  });

  // Return the finished tree, not individual node IDs
  return tree;
}
```

### Predicates and Subjects

- **Predicate**: A logical condition represented as a node in the tree. (Leaf or Junction Node)
- **Subject**: The target of a predicate condition, typically representing a field or property in your data. (FieldId or user input Id)
- **Junction**: A node that combines multiple predicates using logical operators (AND/OR). Junction Node

### Subtrees

Subtrees are a powerful feature that enables complex and reusable hierarchical structures within your predicate trees.

#### What are Subtrees?

A subtree is a complete, independent predicate tree that is embedded within another predicate tree. Each subtree has its own root node and maintains its own internal structure.

**Important Awareness Relationship**: A subtree is completely unaware of its parent (outer) tree - it operates as if it were an independent entity. However, the parent tree is fully aware of its subtrees and has the ability to either include or exclude subtrees in various operations through parameters like `shouldIncludeSubtrees`. This unidirectional awareness is by design and promotes clean separation of concerns.

```
NOTES
- How do we access subtree?
- Do we have an example.  [tree].getSubtreeAt(nodeId)? - I am not sure.
```

**Important Implementation Detail**: Subtrees identify their nodes independently from the parent tree, maintaining their own internal ID system. However, there is one critical connection point: the subtree's root node ID is synchronized with the parent tree's child node ID at the attachment point. This design allows the parent tree to properly reference the subtree while maintaining the subtree's internal independence.

```
Parent Tree         Subtree
   |                   |
   A                   X.0 (root)
  / \                 / \
 B   C (attach)      Y   Z
    /
   X.0 (refers to subtree root)
```

In this diagram, node C in the parent tree points to subtree with root X.0. Internally, the subtree considers X.0 as its root ID, while the parent tree references it through node C.

#### Key Characteristics of Subtrees:

- **Independent Structure**: Subtrees maintain their own internal node hierarchy.
- **Isolation**: Changes within a subtree don't directly affect the parent tree structure.
- **Reusability**: The same subtree structure can be reused across multiple parts of a predicate tree.
- **Encapsulation**: Complex logic can be encapsulated within a subtree for better organization.
- Think: g(f(x))), integral(f(x)), derivative(f(x)), ...

#### When to Use Subtrees:

- **Different Rule Systems**: Subtrees can be used to apply different "rules" to the subtree than the outer tree. For example, the outer tree might represent a logical expression while the subtree represents an arithmetic expression. Both will implement a common interface like 'calculateTruthy', but each will implement calculation according to their internal definitions. The arithmetic tree might interpret 0 as false and non-zero as true, while the logical tree follows standard boolean logic.

- **Nested Data Structures**: When dealing with nested objects (like an address within a customer record), subtrees naturally model the relationship.

- **Complex Logical Groups**: When a set of conditions should be treated as a single unit that can be evaluated separately. g(f(x))

- **Reusable Logic**: When the same logical conditions need to be applied in multiple places (multiple 'AddressTree' for customer record: billing and shipping).

- **Dynamic Tree Manipulation**: When parts of the predicate tree need to be added or removed as complete units.

#### Example Use Case:

```typescript
// A subtree for address validation that can be reused
const addressValidationSubtree = {
  _root_: {
    nodeType: "branch",
    nodeContent: { operator: "$and" },
  },
  "_root_->0": {
    nodeType: "leaf",
    nodeContent: {
      subject: "countryCode",
      operator: "$eq",
      value: "US",
    },
  },
  "_root_->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "postalCode",
      operator: "$regex",
      value: "^\\d{5}(-\\d{4})?$",
    },
  },
};

// This subtree can be embedded in multiple customer validation predicates
```

#### Methods for Working with Subtrees:

- `createSubtreeAt(nodeId)`: Creates a new empty subtree at the specified node.
- `appendTreeAt(targetNodeId, sourceTree)`: Appends an existing tree as a subtree at the target node.
- `countTotalNodes(nodeId, shouldIncludeSubtrees)`: Counts nodes with an option to include or exclude subtrees.
- `getChildrenContentOf(nodeId, shouldIncludeSubtrees)`: Gets child content with an option to include subtree content.

## Getting Started

### Installation

```bash
 [_TO_BE_COMPLETED_]
```

### Basic Usage

```typescript
[_TO_BE_COMPLETED_];

const isMatch = matcher.matches(data); // true
```

## Core Components

### AbstractExpressionTree

The `AbstractExpressionTree` is the main component for building and manipulating predicate trees. It provides methods for creating, modifying, and traversing the tree structure.

#### Key Methods

```
Notes:
    const tree = AbstractExpressionFactory.getNewInstance();

    That would be used by the extended factory?

    Because this a support library "usage" is really about extending and using the extended classes.

    Usage should be give example of class ExampleExpressionTree extending AbstractExpressionTree.
    tree = new ExampleExpressionTree([...]);
    tree.appendChildNodeWithContent(...)
    ...
```

```typescript
// Creating a new expression tree
const tree = AbstractExpressionFactory.getNewInstance();

// Adding a child node with content
const nodeId = tree.appendChildNodeWithContent(parentNodeId, nodeContent);

// Creating a subtree at a specific node
const subtree = tree.createSubtreeAt(nodeId);

// Appending a tree at a specific node
const fromToMap = tree.appendTreeAt(targetNodeId, sourceTree);

// Converting to a POJO
const pojo = tree.toPojoAt();

// Creating from a POJO
const tree = AbstractExpressionFactory.fromPojo(pojo);
```

### JsPredicateTree

```
Notes:
    const jsTree = new JsPredicateTree();

    I do not think we mean to export specialized classes?
    Do we intent to export single specialized class, subject dictionary, for examples?

```

A specialized expression tree that can generate JavaScript code for evaluating predicates.

```typescript
import { JsPredicateTree } from "predicate-tree-advanced";

// Create the tree (or get it from AbstractExpressionFactory.fromPojo)
const jsTree = new JsPredicateTree();

// Add predicates (similar to AbstractExpressionTree)

// Generate JavaScript function body for evaluation
const functionBody = jsTree.toFunctionBody(jsTree.rootNodeId, subjects);

// Get a commented record shape (useful for debugging)
const recordShape = jsTree.commentedRecord(subjects);
```

### Matcher

The `Matcher` class provides a high-level API for checking if data matches a predicate tree.

```typescript
import { createMatcher } from "predicate-tree-advanced";

// Create a matcher from predicate POJO and subjects
const matcher = createMatcher(predicatePojo, subjects);

// Check if data matches
const isMatch = matcher.matches(data);

// Get record shape for debugging
const recordShape = matcher.getRecordShape();
```

## Advanced Examples

### Complex Logical Conditions

```typescript
// Predicate tree with complex AND/OR logic
const complexPojo = {
  _root_: {
    nodeType: "branch",
    nodeContent: { operator: "$and" },
  },
  "_root_->0": {
    nodeType: "branch",
    nodeContent: { operator: "$or" },
  },
  "_root_->0->0": {
    nodeType: "leaf",
    nodeContent: {
      subject: "customer.age",
      operator: "$gte",
      value: 18,
    },
  },
  "_root_->0->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "customer.parentConsent",
      operator: "$eq",
      value: true,
    },
  },
  "_root_->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "customer.status",
      operator: "$eq",
      value: "active",
    },
  },
};

// This represents: (age >= 18 OR parentConsent === true) AND status === "active"
```

### Creating Trees Programmatically

```
Notes:
See comments about usage..
```

```typescript
import {
  AbstractExpressionFactory,
  JsPredicateTree,
} from "predicate-tree-advanced";

// Start with an empty tree
const tree = AbstractExpressionFactory.getNewInstance() as JsPredicateTree;

// Set the root node as an "AND" junction
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// Add first condition
const condition1Id = tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.firstname",
  operator: "$eq",
  value: "John",
});

// Add second condition
const condition2Id = tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.age",
  operator: "$gte",
  value: 18,
});

// Convert to a matcher
const matcher = createMatcher(tree.toPojoAt(), subjects);

// Test data
const isMatch = matcher.matches({
  "customer.firstname": "John",
  "customer.age": 25,
}); // true
```

### Nested Objects with Address Example

```typescript
// Define subjects with nested address fields
const subjectsWithAddress = {
  "customer.firstname": { dataType: "string" },
  "customer.lastname": { dataType: "string" },
  "customer.address": {
    dataType: "object",
    shape: {
      address1: { dataType: "string" },
      address2: { dataType: "string" },
      countryCode: { dataType: "string" },
      postalCode: { dataType: "string" },
    },
  },
};
/// NOTE:
// We need to mix it up a little in regards to the node ids in POJO.
// We are using a convention but that is only convention and any key will do.

// Create a predicate tree for address validation
const addressPojo = {
  _root_: {
    nodeType: "branch",
    nodeContent: { operator: "$and" },
  },
  "_root_->0": {
    nodeType: "leaf",
    nodeContent: {
      subject: "customer.firstname",
      operator: "$eq",
      value: "Fred",
    },
  },
  "_root_->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "customer.address",
      operator: "$addressTree",
      subtree: {
        _root_: {
          nodeType: "branch",
          nodeContent: { operator: "$and" },
        },
        "_root_->0": {
          nodeType: "leaf",
          nodeContent: {
            subject: "countryCode",
            operator: "$eq",
            value: "US",
          },
        },
        "_root_->1": {
          nodeType: "leaf",
          nodeContent: {
            subject: "postalCode",
            operator: "$eq",
            value: "70777",
          },
        },
      },
    },
  },
};

// Create a matcher
const addressMatcher = createMatcher(addressPojo, subjectsWithAddress);

// Test with nested data
const data = {
  "customer.firstname": "Fred",
  "customer.address": {
    address1: "1285 Sabattus Road",
    address2: "Apt 101",
    countryCode: "US",
    postalCode: "70777",
  },
};

const isMatch = addressMatcher.matches(data); // true
```

## API Reference

### AbstractExpressionTree Methods

| Method                                                                  | Description                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `appendChildNodeWithContent(parentNodeId, nodeContent)`                 | Adds a child node with content to a parent node            |
| `appendContentWithJunction(parentNodeId, junctionContent, nodeContent)` | Adds content with a logical junction                       |
| `appendContentWithAnd(parentNodeId, nodeContent)`                       | Adds content with an AND junction                          |
| `appendContentWithOr(parentNodeId, nodeContent)`                        | Adds content with an OR junction                           |
| `appendTreeAt(targetNodeId, sourceTree, sourceBranchRootNodeId?)`       | Appends a tree at a target node                            |
| `cloneAt(nodeId?)`                                                      | Creates a clone of the tree starting at the specified node |
| `createSubtreeAt(nodeId)`                                               | Creates a subtree at the specified node                    |
| `getNewInstance(rootSeedNodeId?, nodeContent?)`                         | Creates a new instance of the tree                         |
| `toPojoAt(nodeId?)`                                                     | Converts the tree to a POJO starting at the specified node |
| `replaceNodeContent(nodeId, nodeContent)`                               | Replaces the content of a node                             |
| `removeNodeAt(nodeId)`                                                  | Removes a node from the tree                               |
| `getChildContentAt(nodeId)`                                             | Gets the content of a child node                           |
| `getChildrenContentOf(nodeId, shouldIncludeSubtrees?)`                  | Gets the content of all children of a node                 |
| `getChildrenNodeIdsOf(parentNodeId, shouldIncludeSubtrees?)`            | Gets the IDs of all children of a node                     |
| `visitAllAt(visitor, nodeId?, parentNodeId?)`                           | Visits all nodes starting at the specified node            |
| `visitLeavesOf(visitor, nodeId?, parentNodeId?)`                        | Visits all leaf nodes starting at the specified node       |

### JsPredicateTree Methods

| Method                             | Description                                                    |
| ---------------------------------- | -------------------------------------------------------------- |
| `toFunctionBody(nodeId, subjects)` | Generates a JavaScript function body for evaluating predicates |
| `commentedRecord(subjects)`        | Generates a commented record shape for debugging               |

### Matcher Methods

| Method             | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `matches(data)`    | Checks if data matches the predicate conditions           |
| `getRecordShape()` | Gets a string representation of the expected record shape |

## TypeScript Types

### Node Types

```typescript
type TGenericNodeContent<T extends object> = T | null;

type TNodePojo<T extends object> = {
  nodeType: string;
  nodeContent: TGenericNodeContent<T>;
};

type TTreePojo<T extends object> = {
  [nodeId: string]: TNodePojo<T>;
};
```

### Predicate Types

```typescript
type TPredicateTypes = {
  subject?: string;
  operator?: string;
  value?: any;
  subtree?: TTreePojo<TPredicateTypes>;
};

type TSubjectDictionary = {
  [subject: string]: {
    dataType: string;
    shape?: TSubjectDictionary;
  };
};
```

## Best Practices

1. **Define Your Subjects Clearly**: Always define your subject dictionary with appropriate data types to ensure correct evaluation.

2. **Use Logical Structure**: Organize your predicate tree with clear logical structure using AND/OR junctions.

3. **Subtrees for Complex Logic**: Use subtrees to represent complex nested logic, especially for nested object properties.

4. **Error Handling**: Always implement error handling when evaluating predicates against data.

5. **Testing**: Validate your predicate trees with comprehensive test cases to ensure they match as expected.

## Troubleshooting

### Common Issues

1. **Predicate Not Matching Expected Data**:

   - Verify the subject paths match your data structure exactly
   - Check operators are correctly defined ($eq, $gt, etc.)
   - Ensure the data types match what's expected in the subjects dictionary

2. **Error During Evaluation**:

   - Check for missing fields in your data
   - Ensure all operators are valid
   - Verify subtree structures are properly formed

3. **Performance Issues**:
   - Keep trees as shallow as possible
   - Avoid deeply nested subtrees
   - Consider optimizing complex OR conditions

## Summary

The Predicate Tree Advanced library provides a powerful and flexible way to build, manipulate, and evaluate logical conditions organized in a tree structure. By leveraging this library, you can create complex matching logic for filtering and validating data in a structured and maintainable way.

## TODO

- [ ] Discuss the Visitor Pattern and tree traversal
- [ ] Create examples
- [ ] Verify any code examples in this document
- [ ] Add more tests
