// Main tree implementations
export {
  AbstractExpressionTree,
  GenericExpressionTree,
} from "./DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
export { AbstractObfuscatedExpressionTree } from "./DirectedGraph/AbstractObfuscatedExpressionTree/AbstractObfuscatedExpressionTree";
export { AbstractTree } from "./DirectedGraph/AbstractTree/AbstractTree";
export { AbstractDirectedGraph } from "./DirectedGraph/AbstractDirectedGraph/AbstractDirectedGraph";

// Error types
export { DirectedGraphError } from "./DirectedGraph/DirectedGraphError/DirectedGraphError";

// Interfaces
export {
  ITree,
  ITreeVisitor,
  IExpressionTree,
  IDirectedGraph,
} from "./DirectedGraph/ITree";

// Types
export type {
  TFromToMap,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  TGenericNodeType,
} from "./DirectedGraph/types";

// Utilities
export { isUUIDv4 } from "./common/utilities/isFunctions";
export { Incrementor } from "./DirectedGraph/Incrementor/Incrementor";
export { KeyStore } from "./DirectedGraph/keystore/KeyStore";
export { KeyStoreError } from "./DirectedGraph/keystore/KeyStoreError";
export { default as treeUtils } from "./DirectedGraph/AbstractDirectedGraph/treeUtilities";

// Import needed types for our SafeAPI namespace
import {
  AbstractExpressionTree,
  GenericExpressionTree,
} from "./DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "./DirectedGraph/types";

// =======================================================================
// SafeAPI - Type-safe alternative functions for client code
// =======================================================================

/**
 * SafeAPI provides type-safe alternatives to the problematic static methods
 * in AbstractExpressionTree and GenericExpressionTree.
 *
 * This namespace contains helper functions that work around TypeScript inheritance
 * issues with static methods. Use these methods in client code instead of directly
 * calling static methods on the tree classes.
 *
 * @example
 * ```typescript
 * // Instead of this (which can cause TypeScript errors):
 * const tree = GenericExpressionTree.fromPojo(myPojo);
 *
 * // Use this instead:
 * const tree = SafeAPI.createGenericTree(myPojo);
 * ```
 */
export namespace SafeAPI {
  /**
   * Creates a GenericExpressionTree from a POJO representation
   *
   * This function provides a type-safe way to create a GenericExpressionTree from
   * a Plain Old JavaScript Object (POJO), working around TypeScript inheritance issues
   * with static methods.
   *
   * @example
   * ```typescript
   * const pojo = {
   *   "root-1": {
   *     parentId: null,
   *     nodeContent: { operator: "$and" },
   *     nodeType: "junction"
   *   },
   *   "child-1": {
   *     parentId: "root-1",
   *     nodeContent: { subject: "customer.name", operator: "contains", value: "Smith" }
   *   }
   * };
   *
   * const tree = SafeAPI.createGenericTree(pojo);
   * ```
   *
   * @param srcPojoTree - The source POJO tree to create from
   * @param transform - Optional transform function to customize node content during creation
   * @returns A new GenericExpressionTree instance
   */
  export function createGenericTree<T extends object>(
    srcPojoTree: TTreePojo<T>,
    transform?: (nodeContent: TNodePojo<T>) => TGenericNodeContent<T>
  ): GenericExpressionTree<T> {
    return GenericExpressionTree.fromPojo(
      srcPojoTree,
      transform
    ) as unknown as GenericExpressionTree<T>;
  }

  /**
   * Creates an AbstractExpressionTree from a POJO representation
   *
   * This function provides a type-safe way to create an AbstractExpressionTree from
   * a Plain Old JavaScript Object (POJO), working around TypeScript inheritance issues
   * with static methods.
   *
   * @example
   * ```typescript
   * const pojo = {
   *   "root-1": {
   *     parentId: null,
   *     nodeContent: { operator: "$and" },
   *     nodeType: "junction"
   *   },
   *   "child-1": {
   *     parentId: "root-1",
   *     nodeContent: { subject: "customer.name", operator: "contains", value: "Smith" }
   *   }
   * };
   *
   * const tree = SafeAPI.createAbstractTree(pojo);
   * ```
   *
   * @param srcPojoTree - The source POJO tree to create from
   * @param transform - Optional transform function to customize node content during creation
   * @returns A new AbstractExpressionTree instance
   */
  export function createAbstractTree<T extends object>(
    srcPojoTree: TTreePojo<T>,
    transform?: (nodeContent: TNodePojo<T>) => TGenericNodeContent<T>
  ): AbstractExpressionTree<T> {
    return AbstractExpressionTree.fromPojo(
      srcPojoTree,
      transform
    ) as unknown as AbstractExpressionTree<T>;
  }
}

/**
 * Creates a clone of an entire tree (starting from the root node)
 *
 * This function provides a type-safe way to clone a tree, preserving the
 * specific derived type of the tree.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree();
 * // ... add nodes to tree ...
 *
 * // Create a complete clone of the tree
 * const clonedTree = cloneTree(tree);
 * ```
 *
 * @param tree - The tree to clone
 * @returns A new tree instance of the same type
 */
export function cloneTree<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType): TreeType {
  return tree.cloneAt(tree.rootNodeId) as unknown as TreeType;
}

/**
 * Creates a clone of a tree starting at the specified node
 *
 * This function provides a type-safe way to clone a subtree starting from
 * a specific node, preserving the specific derived type of the tree.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree();
 * const childNodeId = tree.appendChildNodeWithContent(tree.rootNodeId, { value: "test" });
 *
 * // Create a clone starting from the child node
 * const partialClone = cloneTreeFrom(tree, childNodeId);
 * ```
 *
 * @param tree - The tree to clone
 * @param nodeId - The ID of the node to start cloning from
 * @returns A new tree instance of the same type
 */
export function cloneTreeFrom<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType, nodeId: string): TreeType {
  return tree.cloneAt(nodeId) as unknown as TreeType;
}

/**
 * Safely re-roots a tree at the specified node
 *
 * This function provides a type-safe way to create a new tree with the
 * specified node as the new root, preserving the specific derived type of the tree.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree();
 * const childNodeId = tree.appendChildNodeWithContent(tree.rootNodeId, { value: "test" });
 *
 * // Create a new tree with the child node as root
 * const reRootedTree = reRootTree(tree, childNodeId, "new-root");
 * ```
 *
 * @param tree - The tree to re-root
 * @param sourceNodeId - The ID of the node to use as new root
 * @param newRootNodeId - The ID to use for the new root node
 * @returns The re-rooted tree
 */
export function reRootTree<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType, sourceNodeId: string, newRootNodeId: string): TreeType {
  return AbstractExpressionTree.reRootTreeAt(
    tree,
    sourceNodeId,
    newRootNodeId
  ) as unknown as TreeType;
}

/**
 * Creates a subtree at the specified node
 *
 * This function provides a type-safe way to create a subtree at a specified node,
 * preserving the specific derived type of the tree.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree();
 *
 * // Create a subtree at the root node
 * const subtree = createSubtree(tree, tree.rootNodeId);
 * ```
 *
 * @param tree - The parent tree
 * @param parentNodeId - The ID of the parent node where the subtree will be created
 * @returns A new subtree instance
 */
export function createSubtree<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType, parentNodeId: string): TreeType {
  return tree.createSubtreeAt(parentNodeId) as unknown as TreeType;
}

/**
 * Safely gets the content of a node in the tree
 *
 * This function provides a type-safe way to retrieve node content,
 * correctly typed as T rather than a more generic type.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree<MyContentType>();
 * // ... add nodes to tree ...
 *
 * // Get the content of the root node
 * const content = getNodeContent(tree, tree.rootNodeId);
 * // content is correctly typed as MyContentType
 * ```
 *
 * @param tree - The tree to get content from
 * @param nodeId - The ID of the node
 * @returns The content of the node with correct typing
 */
export function getNodeContent<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType, nodeId: string): T {
  return tree.getChildContentAt(nodeId) as unknown as T;
}

/**
 * Converts a tree to its POJO representation
 *
 * This function provides a type-safe way to convert a tree to a POJO,
 * working around TypeScript inheritance issues.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree<MyContentType>();
 * // ... add nodes to tree ...
 *
 * // Convert the entire tree to a POJO
 * const pojo = treeToPojo(tree);
 * ```
 *
 * @param tree - The tree to convert
 * @returns A POJO representation of the tree
 */
export function treeToPojo<T extends object>(
  tree: AbstractExpressionTree<T>
): TTreePojo<T> {
  // The toPojoAt method has a default parameter that uses tree.rootNodeId when undefined
  // TypeScript doesn't recognize this in the type system, so we use the trick of
  // passing undefined directly, which matches the runtime behavior correctly
  return (tree.toPojoAt as any)() as TTreePojo<T>;
}

/**
 * Converts a tree to its POJO representation starting from the specified node
 *
 * This function provides a type-safe way to convert a subtree to a POJO,
 * working around TypeScript inheritance issues.
 *
 * @example
 * ```typescript
 * const tree = new GenericExpressionTree<MyContentType>();
 * const childNodeId = tree.appendChildNodeWithContent(tree.rootNodeId, { value: "test" });
 *
 * // Convert just the subtree to a POJO
 * const subtreePojo = treeToPojoAt(tree, childNodeId);
 * ```
 *
 * @param tree - The tree to convert
 * @param nodeId - The ID of the node to start from
 * @returns A POJO representation of the tree
 */
export function treeToPojoAt<
  T extends object,
  TreeType extends AbstractExpressionTree<T>
>(tree: TreeType, nodeId: string): TTreePojo<T> {
  return tree.toPojoAt(nodeId) as TTreePojo<T>;
}
