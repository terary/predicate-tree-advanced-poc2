# Predicate Tree Library - Usage Examples

This directory contains practical examples demonstrating how to use the Predicate Tree library effectively.

## Overview

The Predicate Tree library provides a flexible and powerful implementation of expression trees for building predicate logic systems. It allows you to:

- Create hierarchical tree structures to represent complex logical expressions
- Work with predicates in a structured, type-safe way
- Serialize and deserialize trees to/from Plain Old JavaScript Objects (POJOs)
- Validate predicates against a schema (subject dictionary)
- Create and manipulate subtrees

This library is particularly useful for building query builders, rules engines, decision trees, and other systems that require complex conditional logic.

## Examples Overview

This directory includes several example projects that demonstrate various aspects of the library:

1. **[Simple Predicate Tree](./00001-simple-predicate-tree)**

   - Basic tree construction and traversal
   - Creating and manipulating nodes
   - Working with predicates

2. **[Subject Dictionary](./00002-predicate-tree-subject-dictionary)**

   - Validating predicates against a schema
   - Type-checking predicate values
   - Using validation functions

3. **[Subtrees](./00003a-predicate-tree-subtrees)**

   - Creating and working with subtrees
   - Nested tree structures

4. **[Subtrees with Object Identity](./00003b-predicate-tree-subtrees-object-identity)**

   - Maintaining object identity in subtrees
   - Understanding how changes propagate

5. **[POJO Import/Export](./00004-predicate-tree-pojo-import-export)**

   - Serializing trees to POJOs
   - Deserializing POJOs back to trees
   - Working with the SafeAPI

6. **[Anti-Patterns](./00005-anti-pattern)**
   - Common mistakes to avoid
   - Best practices

## Key Concepts

The library is built around several key concepts:

### Expression Trees

An expression tree is a hierarchical structure where:

- **Nodes** represent individual expressions or operators
- **Branches** connect nodes in parent-child relationships
- The structure allows for complex nested expressions

### Node Types

The library works with several types of nodes:

- **Predicate Nodes**: Contain subject-operator-value expressions (e.g., `customer.age > 21`)
- **Junction Nodes**: Logical operators like AND ($and) and OR ($or) that combine predicates
- **Subtree Nodes**: Special nodes that can contain entire subtrees with their own structure

### Content vs. Structure

A core design principle is the separation of:

- **Structure**: The hierarchical relationships between nodes (parent-child connections)
- **Content**: The actual data stored in each node (predicates, operators, etc.)

## Working with the SafeAPI

The library provides a `SafeAPI` namespace to work around TypeScript inheritance issues with static methods:

```typescript
import { SafeAPI } from "predicate-tree-advanced-poc";

// Create a tree from a POJO
const pojo = {
  /* your POJO structure */
};
const tree = SafeAPI.createGenericTree(pojo);
```

### Why Use SafeAPI?

Due to TypeScript's limitations with static inheritance, direct use of static methods can cause type errors:

```typescript
// This might cause TypeScript errors due to inheritance issues
const tree = GenericExpressionTree.fromPojo(pojo);

// Use this instead for proper typing
const tree = SafeAPI.createGenericTree(pojo);
```

## Running the Examples

Each example directory contains its own README with detailed explanations. To run an example:

```bash
# Navigate to the example directory
cd 00001-simple-predicate-tree

# Install dependencies (if required)
npm install

# Run the example
npm run start
# or
npm run index.ts
```

## Additional Resources

For a complete API reference, please see the [main documentation](https://terary.github.io/predicate-tree-advanced-poc2/).
