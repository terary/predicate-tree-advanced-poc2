# Predicate Tree Anti-Patterns Example (00005-anti-pattern)

This example demonstrates common anti-patterns and pitfalls to avoid when working with the Predicate Tree library.

## What This Example Demonstrates

- Common mistakes and anti-patterns when using predicate trees
- How these issues can lead to bugs or unexpected behavior
- Best practices to follow instead
- How to troubleshoot and fix common issues

## Key Anti-Patterns Covered

### 1. Direct Static Method Usage

```typescript
// ❌ ANTI-PATTERN: Direct use of static methods can cause TypeScript errors
import { GenericExpressionTree } from "predicate-tree-advanced-poc";

const pojo = {
  /* ... */
};
const tree = GenericExpressionTree.fromPojo(pojo); // TypeScript error!

// ✅ CORRECT APPROACH: Use the SafeAPI namespace
import { SafeAPI } from "predicate-tree-advanced-poc";
const safeTree = SafeAPI.createGenericTree(pojo);
```

### 2. Mutating Cloned Subtrees

```typescript
// ❌ ANTI-PATTERN: Assuming a cloned tree still has references to the original
import { cloneTree, createSubtree } from "predicate-tree-advanced-poc";

const originalTree = new GenericExpressionTree();
const clonedTree = cloneTree(originalTree);

const subtree = createSubtree(originalTree, originalTree.rootNodeId);
// Modify subtree...

// WRONG: This won't affect the cloned tree
const clonedSubtree = createSubtree(clonedTree, clonedTree.rootNodeId);
// They are entirely separate objects

// ✅ CORRECT APPROACH: Understand that clones are separate objects
// If you need changes in both, you must apply them separately
```

### 3. Ignoring Node Content Types

```typescript
// ❌ ANTI-PATTERN: Not respecting node content type constraints
interface TypedContent {
  subject: string;
  operator: string;
  value: number; // Strictly numbers
}

const tree = new GenericExpressionTree<TypedContent>();

// WRONG: TypeScript might allow this but it violates our interface
tree.appendChildNodeWithContent(tree.rootNodeId, {
  subject: "age",
  operator: "greaterThan",
  value: "30", // String instead of number!
});

// ✅ CORRECT APPROACH: Use validation functions
function validateContent(content: any): content is TypedContent {
  return (
    typeof content.subject === "string" &&
    typeof content.operator === "string" &&
    typeof content.value === "number"
  );
}

tree.appendChildNodeWithContent(
  tree.rootNodeId,
  { subject: "age", operator: "greaterThan", value: 30 },
  validateContent
);
```

### 4. Mishandling Subtree Identity

```typescript
// ❌ ANTI-PATTERN: Misunderstanding subtree object identity
const tree = new GenericExpressionTree();
const subtree = createSubtree(tree, tree.rootNodeId);

// WRONG: Treating the subtree as completely independent
// Changes to subtree will affect the parent tree!
subtree.replaceNodeContent(subtree.rootNodeId, { operator: "$or" });

// ✅ CORRECT APPROACH: Be aware that subtrees maintain object identity with parent
// If you need a completely independent copy, use cloning:
import { cloneTreeFrom } from "predicate-tree-advanced-poc";
const independentSubtree = cloneTreeFrom(tree, subtree.rootNodeId);
```

### 5. Incorrect POJO Handling

```typescript
// ❌ ANTI-PATTERN: Manually constructing invalid POJO structures
const invalidPojo = {
  root: { nodeContent: { operator: "$and" } },
  // Missing parentId, will cause problems when deserializing
};

// WRONG: This will likely fail or create invalid trees
const badTree = SafeAPI.createGenericTree(invalidPojo);

// ✅ CORRECT APPROACH: Always use the library's serialization methods
import { treeToPojo } from "predicate-tree-advanced-poc";
const tree = new GenericExpressionTree();
const validPojo = treeToPojo(tree);
```

## Running This Example

```bash
# Navigate to the example directory
cd 00005-anti-pattern

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. Common pitfalls when working with the Predicate Tree library
2. Why these anti-patterns cause problems
3. Best practices to follow instead
4. How to troubleshoot and fix issues related to these anti-patterns

Understanding these anti-patterns will help you write more robust and maintainable code when working with predicate trees.
