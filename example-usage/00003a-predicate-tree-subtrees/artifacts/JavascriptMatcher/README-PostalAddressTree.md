# PostalAddressTree

## Overview

The `PostalAddressTree` is a specialized predicate tree designed to handle address-related conditions in a nested structure. It extends the base `GenericExpressionTree` class and implements the `IJavaScriptMatchable` interface, allowing it to generate JavaScript matcher functions for validating address data.

## Purpose

The main purpose of the `PostalAddressTree` is to provide a clean, structured way to express predicates related to postal addresses. It automatically handles the nesting of address fields in the generated JavaScript expressions, making it easy to create complex address-matching logic.

## Features

- Specialized for address-related predicates with nested field handling
- Generates JavaScript expressions with proper address field path (`record["address"]["field"]`)
- Supports complex nested conditions using AND/OR junctions
- Can be used as a subtree within other predicate trees for more complex matching scenarios
- Full serialization/deserialization support for transporting trees between systems

## Implementation Details

### Structure

The `PostalAddressTree` is designed to work with address data that's nested within records. This allows for proper organization of address-related fields in the generated matcher functions.

### JavaScript Generation

When generating JavaScript expressions, the `PostalAddressTree` automatically prefixes all field references with `"address"`, resulting in expressions like:

```javascript
record["address"]["postalCode"] === "12345";
```

This makes it easy to work with nested record structures without having to manually handle the path construction.

## Serialization & Transportability

The `PostalAddressTree` supports full serialization to a Plain Old JavaScript Object (POJO) format and deserialization back to a functioning tree. This allows trees to be:

- Stored in databases
- Transmitted over networks
- Shared between different parts of an application

### Example of Serialization/Deserialization

```typescript
// Create and configure a tree
const originalTree = new PostalAddressTree();
originalTree.appendChildNodeWithContent(originalTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

// Serialize to POJO
const pojo = originalTree.toPojoAt();

// Later, deserialize to create an identical tree
const clonedTree = PostalAddressTree.fromPojo(pojo);

// Both trees produce identical matcher functions
const originalMatcher = originalTree.buildMatcherFunction();
const clonedMatcher = clonedTree.buildMatcherFunction();

// Both matchers will return the same results for any input
const record = { address: { postalCode: "12345" } };
console.log(originalMatcher.isMatch(record)); // true
console.log(clonedMatcher.isMatch(record)); // true
```

The serialized POJO maintains all the necessary information to reconstruct a fully functional tree, ensuring that matcher functions generated from the original and cloned trees behave identically.

## Usage Examples

### Basic Usage

```typescript
// Create a new PostalAddressTree
const addressTree = new PostalAddressTree();

// Add predicates for postal code and state
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "state",
  operator: "$eq",
  value: "CA",
});

// Generate a matcher function
const matcher = addressTree.buildMatcherFunction();

// Use the matcher to test records
const record = {
  address: {
    postalCode: "12345",
    city: "Los Angeles",
    state: "CA",
  },
};

const isMatch = matcher.isMatch(record); // Returns true
```

### Complex Conditions

The `PostalAddressTree` supports complex conditions using junctions:

```typescript
const addressTree = new PostalAddressTree();

// Create an OR junction for the state
const orJunctionId = addressTree.appendChildNodeWithContent(
  addressTree.rootNodeId,
  {
    operator: "$or",
    _meta: {
      description: "State is either CA or NY",
    },
  }
);

// Add states to the OR junction
addressTree.appendChildNodeWithContent(orJunctionId, {
  subjectId: "state",
  operator: "$eq",
  value: "CA",
});

addressTree.appendChildNodeWithContent(orJunctionId, {
  subjectId: "state",
  operator: "$eq",
  value: "NY",
});

// Add postal code criterion to the main AND junction
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$gt",
  value: "10000",
});

// Generate matcher function
const matcher = addressTree.buildMatcherFunction();
```

The generated JavaScript expression will be equivalent to:

```javascript
(record["address"]["state"] === "CA" || record["address"]["state"] === "NY") &&
  record["address"]["postalCode"] > "10000";
```

### Integration with Other Trees

The `PostalAddressTree` can be used as a subtree within other predicate trees for more complex matching scenarios:

```typescript
// Create a main predicate tree
const mainTree = new PredicateTree();

// Create a postal address subtree
const addressTree = new PostalAddressTree();

// Add address predicates
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

// Add the address tree as a subtree to the main tree
mainTree.appendChildNodeWithContent(mainTree.rootNodeId, addressTree);

// Add other predicates to the main tree
mainTree.appendChildNodeWithContent(mainTree.rootNodeId, {
  subjectId: "age",
  operator: "$gt",
  value: 18,
});

// Generate matcher function
const matcher = mainTree.buildMatcherFunction();
```

## Record Structure

The `PostalAddressTree` expects records with a nested `address` structure:

```javascript
const record = {
  // Other fields...
  address: {
    postalCode: "12345",
    city: "Los Angeles",
    state: "CA",
    street: "123 Main St",
    // Other address fields...
  },
};
```

This structured approach makes it easy to work with complex nested data while maintaining clean, readable predicate expressions.
