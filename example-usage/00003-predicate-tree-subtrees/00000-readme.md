# Predicate Tree with Subtrees

This example demonstrates how to use subtrees in predicate trees to encapsulate different behaviors within a single tree structure. Subtrees are a powerful feature that allow for modular and reusable tree components.

## What This Example Shows

1. **Tree Composition**: How to compose trees by attaching subtrees to parent trees
2. **Specialized Behavior**: How subtrees can implement specialized logic (like negation)
3. **Tree Structure**: How to navigate and validate complex tree structures with subtrees
4. **POJO Representation**: How subtrees are represented in the POJO format
5. **Transportability**: How subtrees can be reused across multiple parent trees

## Key Components

### Main Logic Expression Tree

The main tree serves as a container for both direct predicates and subtrees. This demonstrates how a single tree can combine different types of nodes:

```typescript
const logicTree = new LogicExpressionTree();
// Add regular predicates
logicTree.appendChildNodeWithContent(logicTree.rootNodeId, {
  subject: "A",
  operator: "$eq",
  value: "example",
});
// Attach a subtree
logicTree.attachSubtree(logicTree.rootNodeId, specializedSubtree);
```

### NotTree Subtree

The NotTree is a specialized tree that negates all of its predicates. When used as a subtree, it brings this negation behavior into the parent tree:

```typescript
class NotTree extends GenericExpressionTree<PredicateContent> {
  // When nodes are added, mark them as negated
  appendChildNodeWithContent(parentNodeId, nodeContent) {
    const contentWithMeta = {
      ...nodeContent,
      _meta: {
        ...(nodeContent._meta || {}),
        negated: true,
      },
    };
    return super.appendChildNodeWithContent(parentNodeId, contentWithMeta);
  }
}
```

### Subtree Attachment

The core of this example demonstrates how to attach a subtree to a parent tree:

```typescript
attachSubtree(parentNodeId, subtree) {
  // Create a special node that marks this as a subtree
  const subtreeNodeId = this.appendChildNodeWithContent(
    parentNodeId,
    { operator: "$subtree" }
  );

  // Export the subtree to POJO and store it
  const subtreePojo = subtree.toPojoAt(subtree.rootNodeId);
  this.replaceNodeContent(subtreeNodeId, {
    operator: "$subtree",
    subtreeRoot: subtreePojo,
    subtreeType: subtree.constructor.name
  });

  return subtreeNodeId;
}
```

## Running the Examples

This directory contains examples that demonstrate different aspects of using subtrees with predicate trees:

1. **NOT Subtree**: Shows how to create a specialized tree that negates predicates

You can run the examples using the provided script:

```bash
# Run the NOT subtree example
./index-run.sh --not

# Run all available examples
./index-run.sh --all

# Show help information
./index-run.sh --help
```

## Why Use Subtrees?

Subtrees provide several benefits for complex logical expressions:

1. **Encapsulation**: Different behaviors can be encapsulated in separate trees
2. **Reusability**: Subtrees can be reused in multiple places
3. **Separation of Concerns**: Different types of logic can be separated into distinct trees
4. **Dynamic Composition**: Trees can be composed at runtime

This approach is particularly useful for building complex filtering logic, query builders, or rule engines where different parts of the logic might follow different rules or transformations.
