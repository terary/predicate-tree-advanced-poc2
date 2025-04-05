# Predicate Tree Subtrees and Node Identity

Subtrees identify their nodes independently from the parent tree, maintaining their own internal ID system. However, there is one critical connection point: the subtree's root node ID is synchronized with the parent tree's child node ID at the attachment point. This design allows the parent tree to properly reference the subtree while maintaining the subtree's internal independence.

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

## Demonstration

These example demonstrate the root node/child node of tree/subtree relationship.
