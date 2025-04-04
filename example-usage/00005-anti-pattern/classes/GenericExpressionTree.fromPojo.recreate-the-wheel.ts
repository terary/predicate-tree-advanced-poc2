/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import {
  AbstractTree,
  TGenericNodeContent,
  TNodePojo,
  treeUtils,
  TTreePojo,
} from "../../../src";

class GenericExpressionTreeAntiPattern {}

type PredicateContent = any;
/**
 * ANTI PATTERN: - Using traditional loops to walk the pojo tree.
 *
 *
 *
 *
 *
 * and supports POJO import/export
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class PredicateTreeAntiPattern extends GenericExpressionTreeAntiPattern<PredicateContent> {
  /**
   *  Reasons why this is an anti-pattern:
   *
   *  - It is not using any of the built in tools for manipulating pojo trees.
   *  - Therefore it is not using existing patterns for building trees.
   *  - "Building Trees" and "Manipulating Pojo" are different in that wit the POJO
   *     we do validation, we we are destructive with the document.  This routine
   *     is goofing both of those activities.
   *  - Had we used the provided examples/patterns/tools, the rest of the issue
   *    with this routine would be moot.
   *  - I don't love defining a function within a function. Although, sound
   *    practice probably, it is unfamiliar to me and causes concern it could lead to confusion
   *
   *
   *
   *   ** THE NUMBER ONE BIG ISSUE **
   *   This routine is trying to walk the Pojo document to create the tree.
   *   We provide tools to do this therefore we are recreating the wheel
   *   that is less good.
   */
  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P extends object ? P : never>
  ): PredicateTreeAntiPattern {
    // Find the root node
    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);
    const rootNodePojo = srcPojoTree[rootNodeId];

    // Create a new PredicateTree instance
    // @ts-ignore - we will need to fix this
    const dTree = new PredicateTree(rootNodeId);

    // Set the root node content
    const transformer =
      transform || ((nodeContent: TNodePojo<P>) => nodeContent.nodeContent);
    // @ts-ignore - we will need to fix this
    dTree.replaceNodeContent(dTree.rootNodeId, transformer(rootNodePojo));

    // Use a copy of the POJO tree to avoid modifying the original
    const workingPojo = { ...srcPojoTree };

    // Remove the root node since we've already processed it
    delete workingPojo[rootNodeId];

    // Create a mapping of nodeId to subtree instances
    // This helps us keep track of all subtrees we create
    const subtreeMap = new Map<string, any>();
    subtreeMap.set(rootNodeId, dTree);

    // Process all nodes
    const processNodes = (parentId: string) => {
      // Get the parent subtree (either the main tree or a previously created subtree)
      const parentTree = subtreeMap.get(parentId) || dTree;

      // Extract all children of the parent (this modifies workingPojo)
      const childrenNodes = treeUtils.extractChildrenNodes(
        parentId,
        workingPojo
      );

      // Process each child
      Object.entries(childrenNodes).forEach(([childId, node]) => {
        if (
          node.nodeType &&
          node.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName)
        ) {
          // Create appropriate subtree type
          const subtree = parentTree.createSubtreeOfTypeAt(
            parentId,
            node.nodeType
          );

          // Set content
          subtree.replaceNodeContent(
            subtree.rootNodeId,
            transformer(node as TNodePojo<P>)
          );

          // Add to our map for future lookups
          subtreeMap.set(childId, subtree);

          // Process this subtree's children recursively
          processNodes(childId);
        } else {
          // Add this node to the tree
          const newNodeId = parentTree.appendChildNodeWithContent(
            parentId,
            transformer(node as TNodePojo<P>)
          );

          // Process this node's children recursively
          processNodes(childId);
        }
      });
    };

    // Start processing from the root
    processNodes(rootNodeId);

    // Check for orphan nodes (any node left in workingPojo after processing)
    if (Object.keys(workingPojo).length > 0) {
      throw new Error(
        `Orphan nodes detected: ${Object.keys(workingPojo).join(", ")}`
      );
    }

    return dTree;
  }
}
