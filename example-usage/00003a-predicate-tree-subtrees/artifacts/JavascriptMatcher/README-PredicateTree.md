# PredicateTree

## Overview

The `PredicateTree` is a master predicate tree designed to contain and coordinate multiple specialized subtrees. It extends the base `GenericExpressionTree` class and implements the `IJavaScriptMatchable` interface, allowing it to generate JavaScript matcher functions that combine the functionality of all its subtrees.

## Purpose

The main purpose of the `PredicateTree` is to serve as a container for different specialized subtree types (`NotTree`, `PostalAddressTree`, `ArithmeticTree`), enabling the creation of complex, hierarchical predicates that can be compiled into JavaScript matcher functions.

## Features

- Acts as a master tree that can contain various specialized subtrees
- Generates JavaScript expressions that correctly incorporate all subtree expressions
- Supports creation and management of different subtree types
- Provides methods to build JavaScript matcher functions that combine all subtrees
- Full serialization/deserialization support for transporting complex trees between systems

## Implementation Details

### Structure

The `PredicateTree` is designed to work as a container for different types of specialized subtrees. Each node in the tree can either be:

1. A regular predicate node with a condition
2. A junction node (`$and`, `$or`) grouping other nodes
3. A specialized subtree node containing another tree type

This hierarchical structure allows for creating complex, nested predicate expressions that combine different specialized logic.

### Subtree Management

The `PredicateTree` provides specialized methods for creating and managing different types of subtrees:

- `createNotTreeAt` - Creates a `NotTree` at a specified node
- `createPostalAddressTreeAt` - Creates a `PostalAddressTree` at a specified node
- `createArithmeticTreeAt` - Creates an `ArithmeticTree` at a specified node
- `createSubtreeOfTypeAt` - Generic method to create a subtree of a specific type

### JavaScript Generation

When generating JavaScript expressions, the `PredicateTree` traverses its structure, including all subtrees, and builds a comprehensive expression that correctly combines the functionality of all contained trees.

For example, it can generate expressions like:

```javascript
!(record["age"] > 18) &&
  record["address"]["postalCode"] === "12345" &&
  record["price"] * record["quantity"] - record["discount"] > 100;
```

This combines logic from a `NotTree`, a `PostalAddressTree`, and an `ArithmeticTree`.

## Serialization & Transportability

The `PredicateTree` supports full serialization to a Plain Old JavaScript Object (POJO) format and deserialization back to a functioning tree with all subtrees intact. This allows complex trees to be:

- Stored in databases
- Transmitted over networks
- Shared between different parts of an application

### Example of Serialization/Deserialization

```typescript
// Create and configure a complex tree with subtrees
const originalTree = new PredicateTree();

// Add a NotTree subtree
const notTree = originalTree.createNotTreeAt(originalTree.rootNodeId);
notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  subjectId: "age",
  operator: "$lt",
  value: 18,
});

// Add a PostalAddressTree subtree
const addressTree = originalTree.createPostalAddressTreeAt(
  originalTree.rootNodeId
);
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

// Serialize to POJO
const pojo = originalTree.toPojoAt();

// Later, deserialize to create an identical tree with all subtrees
const clonedTree = PredicateTree.fromPojo(pojo);

// Both trees produce identical matcher functions
const originalMatcher = originalTree.buildMatcherFunction();
const clonedMatcher = clonedTree.buildMatcherFunction();

// Both matchers will return the same results for any input
const record = {
  age: 25,
  address: { postalCode: "12345" },
};
console.log(originalMatcher.isMatch(record)); // true
console.log(clonedMatcher.isMatch(record)); // true
```

The serialized POJO maintains all the necessary information to reconstruct a fully functional tree with all its subtrees, ensuring that matcher functions generated from the original and cloned trees behave identically.

## Usage Examples

### Basic Usage with Multiple Subtrees

```typescript
// Create a new PredicateTree
const predicateTree = new PredicateTree();

// Add a simple predicate directly to the root
predicateTree.appendChildNodeWithContent("simple", {
  subjectId: "name",
  operator: "$eq",
  value: "John",
});

// Add a NotTree subtree
const notTree = predicateTree.createNotTreeAt(predicateTree.rootNodeId);
notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  subjectId: "age",
  operator: "$lt",
  value: 18,
});

// Add a PostalAddressTree subtree
const addressTree = predicateTree.createPostalAddressTreeAt(
  predicateTree.rootNodeId
);
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

// Generate a matcher function
const matcher = predicateTree.buildMatcherFunction();

// Use the matcher to test records
const record = {
  name: "John",
  age: 25,
  address: {
    postalCode: "12345",
  },
};

const isMatch = matcher.isMatch(record); // Returns true
```

### Complex Hierarchical Structures

The `PredicateTree` supports complex hierarchical structures with nested subtrees:

```typescript
// Create a main predicate tree
const predicateTree = new PredicateTree();

// Create a NOT tree that contains an address tree
const notTree = predicateTree.createNotTreeAt(predicateTree.rootNodeId);

// Create an address tree inside the NOT tree
const addressTreeInsideNot = notTree.createPostalAddressTreeAt(
  notTree.rootNodeId
);
addressTreeInsideNot.appendChildNodeWithContent(
  addressTreeInsideNot.rootNodeId,
  {
    subjectId: "state",
    operator: "$eq",
    value: "NY",
  }
);

// Add an arithmetic tree to the main tree
const arithmeticTree = predicateTree.createArithmeticTreeAt(
  predicateTree.rootNodeId
);
arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
  arithmeticOperator: ">",
  value: 100,
});

// Set up the arithmetic expression (price * quantity)
const multiplyNode = arithmeticTree.appendChildNodeWithContent(
  arithmeticTree.rootNodeId,
  {
    arithmeticOperator: "*",
  }
);

arithmeticTree.appendChildNodeWithContent(multiplyNode, {
  subjectId: "price",
});

arithmeticTree.appendChildNodeWithContent(multiplyNode, {
  subjectId: "quantity",
});

// Generate matcher function
const matcher = predicateTree.buildMatcherFunction();
```

This creates a complex predicate that combines multiple types of conditions and subtrees in a hierarchical structure.

## Integration with Other Components

The `PredicateTree` is designed to work seamlessly with the other trees in the system:

- `NotTree` - For negating conditions
- `PostalAddressTree` - For handling address-related conditions
- `ArithmeticTree` - For arithmetic computations and comparisons

By combining these specialized trees in a unified structure, the `PredicateTree` allows for creating sophisticated, yet maintainable predicate expressions.
