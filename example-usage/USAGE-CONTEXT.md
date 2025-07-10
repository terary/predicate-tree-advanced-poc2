# Predicate Tree Library - Usage Guide

This document provides a comprehensive overview of the Predicate Tree library, its architecture, and how to use it effectively in your projects.

## Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Examples Index](#examples-index)
- [Working with the SafeAPI](#working-with-the-safeapi)
- [Common Use Cases](#common-use-cases)
- [Advanced Usage](#advanced-usage)
- [Architecture Decisions](#architecture-decisions)
- [Troubleshooting](#troubleshooting)

## Overview

The Predicate Tree library provides a flexible and powerful implementation of expression trees for building predicate logic systems. It allows you to:

- Create hierarchical tree structures to represent complex logical expressions
- Work with predicates in a structured, type-safe way
- Serialize and deserialize trees to/from Plain Old JavaScript Objects (POJOs)
- Validate predicates against a schema (subject dictionary)
- Create and manipulate subtrees

This library is particularly useful for building query builders, rules engines, decision trees, and other systems that require complex conditional logic.

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

## Installation

```bash
npm install predicate-tree-advanced-poc
```

## Basic Usage

### Creating a Simple Tree

```typescript
import { GenericExpressionTree } from "predicate-tree-advanced-poc";

// Create a new tree
const tree = new GenericExpressionTree();

// The tree starts with a root node, which is typically a junction (AND/OR)
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// Add child nodes with predicates
tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.name",
  operator: "contains",
  value: "Smith",
});

tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.age",
  operator: "greaterThan",
  value: 30,
});
```

## Examples Index

This library includes several example projects that demonstrate different aspects of its functionality:

1. **[Simple Predicate Tree](./00001-USAGE-CONTEXT.md)** (00001-simple-predicate-tree)

   - Basic tree construction and traversal
   - Creating and manipulating nodes
   - Working with predicates

2. **[Subject Dictionary](./00002-USAGE-CONTEXT.md)** (00002-predicate-tree-subject-dictionary)

   - Validating predicates against a schema
   - Type-checking predicate values
   - Using validation functions

3. **[Subtrees](./00003a-USAGE-CONTEXT.md)** (00003a-predicate-tree-subtrees)

   - Creating and working with subtrees
   - Nested tree structures

4. **[Subtrees with Object Identity](./00003b-USAGE-CONTEXT.md)** (00003b-predicate-tree-subtrees-object-identity)

   - Maintaining object identity in subtrees
   - Understanding how changes propagate

5. **[POJO Import/Export](./00004-USAGE-CONTEXT.md)** (00004-predicate-tree-pojo-import-export)

   - Serializing trees to POJOs
   - Deserializing POJOs back to trees
   - Working with the SafeAPI

6. **[Anti-Patterns](./00005-USAGE-CONTEXT.md)** (00005-anti-pattern)
   - Common mistakes to avoid
   - Best practices

Each example includes its own documentation file with detailed explanations and code samples.

## Working with the SafeAPI

The library provides a `SafeAPI` namespace to work around TypeScript inheritance issues with static methods:

```typescript
import { SafeAPI } from "predicate-tree-advanced-poc";

// Create a tree from a POJO
const pojo = {
  /* ... your POJO structure ... */
};
const tree = SafeAPI.createGenericTree(pojo);

// You can also create an AbstractExpressionTree if needed
const abstractTree = SafeAPI.createAbstractTree(pojo);
```

### Why Use SafeAPI?

Due to TypeScript's limitations with static inheritance, direct use of static methods can cause type errors:

```typescript
// This might cause TypeScript errors due to inheritance issues
const tree = GenericExpressionTree.fromPojo(pojo);

// Use this instead for proper typing
const tree = SafeAPI.createGenericTree(pojo);
```

## Common Use Cases

### 1. Building a Query Builder

```typescript
import { GenericExpressionTree, treeToPojo } from "predicate-tree-advanced-poc";

function buildQueryTree(filters) {
  const tree = new GenericExpressionTree();
  tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

  // Add filters as child nodes
  Object.entries(filters).forEach(([key, value]) => {
    tree.appendChildNodeWithContent(tree.rootNodeId, {
      subject: key,
      operator: "equals",
      value: value,
    });
  });

  return tree;
}

// Use it
const filters = {
  "customer.status": "active",
  "customer.region": "North America",
};

const queryTree = buildQueryTree(filters);
const queryPojo = treeToPojo(queryTree);

// This POJO can be sent to a server or stored for later use
```

### 2. Validating Predicates with a Subject Dictionary

The library can validate predicate values against a schema:

```typescript
import { GenericExpressionTree } from "predicate-tree-advanced-poc";

// Define a subject dictionary (schema)
const subjectDictionary = {
  "customer.name": { datatype: "string" },
  "customer.age": { datatype: "number" },
  "customer.isActive": { datatype: "boolean" },
  "customer.createdAt": { datatype: "date" },
};

// Create a validation function
function validateNodeContent(content) {
  if (content.operator === "$and" || content.operator === "$or") {
    return true; // Junction operators don't need validation
  }

  if (!content.subject || !subjectDictionary[content.subject]) {
    throw new Error(`Unknown subject: ${content.subject}`);
  }

  const subjectType = subjectDictionary[content.subject].datatype;

  // Validate value type
  switch (subjectType) {
    case "string":
      if (typeof content.value !== "string") {
        throw new Error(`Value for ${content.subject} must be a string`);
      }
      break;
    case "number":
      if (typeof content.value !== "number") {
        throw new Error(`Value for ${content.subject} must be a number`);
      }
      break;
    case "boolean":
      if (typeof content.value !== "boolean") {
        throw new Error(`Value for ${content.subject} must be a boolean`);
      }
      break;
    case "date":
      if (
        !(content.value instanceof Date) &&
        isNaN(Date.parse(content.value))
      ) {
        throw new Error(`Value for ${content.subject} must be a valid date`);
      }
      break;
  }

  return true;
}

// Use it with the tree
const tree = new GenericExpressionTree();
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// This will validate successfully
tree.appendChildNodeWithContent(
  tree.rootNodeId,
  {
    subject: "customer.age",
    operator: "greaterThan",
    value: 30,
  },
  validateNodeContent
);
```

### 3. Working with Subtrees

Subtrees allow for more complex hierarchical structures:

```typescript
import {
  GenericExpressionTree,
  createSubtree,
} from "predicate-tree-advanced-poc";

// Create main tree
const tree = new GenericExpressionTree();
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// Add a simple predicate
tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.status",
  operator: "equals",
  value: "active",
});

// Create a subtree with OR logic
const subtree = createSubtree(tree, tree.rootNodeId);
subtree.replaceNodeContent(subtree.rootNodeId, { operator: "$or" });

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

## Advanced Usage

### Tree Manipulation

```typescript
import {
  GenericExpressionTree,
  cloneTree,
  cloneTreeFrom,
  reRootTree,
} from "predicate-tree-advanced-poc";

// Create a tree
const tree = new GenericExpressionTree();
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

const nodeId1 = tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.status",
  operator: "equals",
  value: "active",
});

const nodeId2 = tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.region",
  operator: "equals",
  value: "North America",
});

// Clone the entire tree
const fullClone = cloneTree(tree);

// Clone just a subtree starting from a specific node
const partialClone = cloneTreeFrom(tree, nodeId2);

// Create a new tree with a different root node
const reRooted = reRootTree(tree, nodeId1, "new-root-id");
```

### Custom Node Content Types

You can define your own node content types:

```typescript
import { GenericExpressionTree } from "predicate-tree-advanced-poc";

// Define a custom node content type
interface CustomNodeContent {
  customField?: string;
  subject?: string;
  operator?: string;
  value?: any;
}

// Create a tree with the custom content type
const tree = new GenericExpressionTree<CustomNodeContent>();

// Use the custom content
tree.replaceNodeContent(tree.rootNodeId, {
  operator: "$and",
  customField: "Custom root node",
});

tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "customer.name",
  operator: "contains",
  value: "Smith",
  customField: "Custom predicate node",
});
```

## Architecture Decisions

### Content and Structure Separation

The library maintains a strict separation between:

1. **Content**: The data stored in nodes (predicates, operators)
2. **Structure**: The relationship between nodes (parent-child connections)

This separation allows for:

- Greater flexibility in node content types
- Better serialization/deserialization
- Easier tree manipulation

### Object Identity in Subtrees

When working with subtrees, object identity is maintained. This means:

- A subtree is both a node in the parent tree and a tree object itself
- Changes to a subtree are reflected in the parent tree automatically

## Troubleshooting

### TypeScript Inheritance Issues

**Problem**: TypeScript errors when using static methods like `fromPojo` directly:

```
Class static side 'typeof ArithmeticTree' incorrectly extends base class static side 'typeof GenericExpressionTree'
```

**Solution**: Use the `SafeAPI` namespace instead:

```typescript
// Instead of:
const tree = GenericExpressionTree.fromPojo(pojo);

// Use:
const tree = SafeAPI.createGenericTree(pojo);
```

### Node Content Validation Errors

**Problem**: Validation errors when adding nodes with invalid content.

**Solution**: Check that your node content matches the expected format for your tree type and any validation functions you're using.
