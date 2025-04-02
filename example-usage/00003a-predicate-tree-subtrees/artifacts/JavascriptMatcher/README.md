# JavaScript Matcher Example

This example demonstrates how to use the PredicateTree system to build JavaScript matcher functions that can evaluate complex conditions against data records.

## Overview

The JavaScript Matcher allows you to:

1. Create predicate trees with various conditions
2. Combine different specialized subtrees (NotTree, PostalAddressTree, ArithmeticTree)
3. Convert these trees into JavaScript functions that can match against data records
4. Serialize/deserialize trees to/from POJO (Plain Old JavaScript Object) format

## Key Components

### PredicateTree

The main tree class that can contain various specialized subtrees. It generates JavaScript matcher functions that evaluate predicates against data records.

```typescript
// Create a basic predicate tree
const predicateTree = new PredicateTree();

// Add conditions
predicateTree.appendChildNodeWithContent(predicateTree.rootNodeId, {
  subjectId: "age",
  operator: "$gt",
  value: 18,
});

// Build a JavaScript matcher function
const matcher = predicateTree.buildMatcherFunction();

// Use the matcher
const result = matcher.isMatch(record);
```

### Specialized Subtrees

#### NotTree

Negates the logic of its child predicates.

```typescript
const notTree = predicateTree.createNotTreeAt(predicateTree.rootNodeId);
notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  subjectId: "age",
  operator: "$lt",
  value: 21,
});
```

#### PostalAddressTree

Specialized for handling address-related predicates.

```typescript
const addressTree = predicateTree.createPostalAddressTreeAt(
  predicateTree.rootNodeId
);
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "city",
  operator: "$eq",
  value: "Springfield",
});
```

#### ArithmeticTree

Handles arithmetic expressions and operations.

```typescript
const arithmeticTree = predicateTree.createArithmeticTreeAt(
  predicateTree.rootNodeId
);
arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
  arithmeticOperator: "+",
});
arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
  subjectId: "age",
});
arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
  constant: 10,
});
```

## POJO Serialization

Trees can be converted to and from POJO format for storage or transmission:

```typescript
// Convert to POJO
const pojo = predicateTree.toPojoAt();

// Create a tree from POJO
const rebuiltTree = PredicateTree.fromPojo(pojo);
```

## Example Usage

The example demonstrates three main use cases:

1. **Basic Predicate Tree**: Simple conditions directly in the main tree
2. **Complex Tree with Subtrees**: Combining multiple specialized subtrees
3. **Creating from POJO**: Building a tree from a predefined POJO structure

## Running the Example

To run the example:

```bash
npx ts-node index.ts
```

The output will show:

- How to create various types of trees
- The JavaScript code generated from these trees
- The results of matching against test records
- Serialization and deserialization examples

## Technical Implementation

The PredicateTree class extends GenericExpressionTree and implements IJavaScriptMatchable. It handles:

- Creating and integrating specialized subtrees
- Generating JavaScript matcher expressions from tree structures
- Converting predicates to JavaScript comparison operations
- Handling operators, values, and subject IDs in a type-safe way
- Proper serialization and deserialization of tree structures

## Subject Dictionary

The implementation utilizes a subject dictionary that defines the structure of records that can be matched:

```typescript
// Example record matching the subject dictionary
const record = {
  firstName: "John",
  lastName: "Doe",
  age: 25,
  isActive: true,
  // ... other fields
};
```

## Important Patterns

This implementation uses several important patterns:

1. **Composition of trees**: Building complex trees by combining specialized subtrees
2. **Visitor pattern**: For processing tree nodes
3. **Factory methods**: For creating subtrees of different types
4. **Serialization/deserialization**: For storing and reconstructing trees
