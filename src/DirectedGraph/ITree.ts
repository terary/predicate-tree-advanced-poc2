// Clean up imports -- everything should import locally or from '../src', not '../src/dir0/dir1'

import { TGenericNodeContent, TTreePojo, TGenericNodeType } from "./types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import type { TFromToMap } from "./types";

/**
 * Interface for a visitor that traverses the tree
 *
 * @template T - The type of node content in the tree
 */
interface ITreeVisitor<T extends object> {
  /**
   * Method called on each node during traversal
   *
   * @param nodeId - The ID of the current node
   * @param nodeContent - The content of the current node
   * @param parentId - The ID of the parent node
   */
  visit: (
    nodeId: string,
    nodeContent: TGenericNodeContent<T>,
    parentId: string
  ) => void;

  /**
   * Whether to include subtrees in the traversal
   */
  includeSubtrees: boolean;
}

/**
 * Interface for a directed tree data structure
 *
 * The tree consists of nodes connected in a hierarchical structure.
 * Each node can contain a value of type T, null, or another tree.
 *
 * @template T - The type of node content in the tree
 */
interface ITree<T extends object> {
  /**
   * The ID of the root node of the tree
   */
  rootNodeId: string;

  /**
   * Appends a child node with the provided content to a specified parent node
   *
   * @param treeParentId - The ID of the parent node
   * @param nodeContent - The content to be stored in the new node
   * @returns The ID of the newly created node
   */
  appendChildNodeWithContent(
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ): string;

  /**
   * Appends a source tree as a subtree at the specified target node
   *
   * @param targetNodeId - The ID of the target node where the tree will be appended
   * @param sourceTree - The source tree to append
   * @param sourceBranchRootNodeId - Optional ID of a branch in the source tree to append
   * @returns Mapping from source node IDs to target node IDs
   */
  appendTreeAt(
    targetNodeId: string,
    sourceTree: ITree<T>,
    sourceBranchRootNodeId?: string | undefined
  ): TFromToMap[];

  /**
   * Counts the greatest depth from the specified node to its furthest leaf
   *
   * @param nodeId - Optional ID of the node to start counting from (defaults to root)
   * @returns The greatest depth
   */
  countGreatestDepthOf(nodeId?: string): number;

  /**
   * Counts the number of leaf nodes under the specified node
   *
   * @param nodeId - Optional ID of the node to start counting from (defaults to root)
   * @returns The number of leaf nodes
   */
  countLeavesOf(nodeId?: string): number;

  /**
   * Counts the number of descendants of the specified node
   *
   * @param nodeId - Optional ID of the node to start counting from (defaults to root)
   * @returns The number of descendants
   */
  countDescendantsOf(nodeId?: string): number;

  /**
   * Counts the total number of nodes in the tree or subtree
   *
   * @param nodeId - Optional ID of the node to start counting from (defaults to root)
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns The total number of nodes
   */
  countTotalNodes(nodeId?: string, shouldIncludeSubtrees?: boolean): number;

  /**
   * Gets the content of the node with the specified ID
   *
   * @param nodeId - The ID of the node
   * @returns The content of the node
   */
  getChildContentAt(nodeId: string): TGenericNodeContent<T>;

  /**
   * Gets the content of all children of the specified node
   *
   * @param nodeId - The ID of the parent node
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of node contents
   */
  getChildrenContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];

  /**
   * Gets the IDs of all children of the specified node
   *
   * @param parentNodeId - The ID of the parent node
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of node IDs
   */
  getChildrenNodeIdsOf(
    parentNodeId: string,
    shouldIncludeSubtrees?: boolean
  ): string[];

  /**
   * Gets the IDs of nodes whose content matches the provided function
   *
   * @param matcherFn - Function that returns true for matching nodes
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of matching node IDs
   */
  getNodeIdsWithNodeContent(
    matcherFn: (nodeContent: T) => boolean,
    shouldIncludeSubtrees?: boolean
  ): string[];

  /**
   * Gets the content of all descendants of the specified node
   *
   * @param nodeId - The ID of the parent node
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of node contents
   */
  getDescendantContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];

  /**
   * Gets the IDs of all descendants of the specified node
   *
   * @param parentNodeKey - The ID of the parent node
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of node IDs
   */
  getDescendantNodeIds(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): string[];

  /**
   * Gets the ID of the parent of the specified node
   *
   * @param nodeId - The ID of the node
   * @returns The ID of the parent node
   */
  getParentNodeId(nodeId: string): string;

  /**
   * Gets the IDs of siblings of the specified node
   *
   * @param nodeId - The ID of the node
   * @returns Array of sibling node IDs
   */
  getSiblingIds(nodeId: string): string[];

  /**
   * Gets the IDs of subtrees at the specified node
   *
   * @param nodeId - Optional ID of the node (defaults to root)
   * @returns Array of subtree IDs
   */
  getSubtreeIdsAt(nodeId?: string): string[];

  /**
   * Gets the content of all nodes in the tree or subtree
   *
   * @param nodeId - Optional ID of the node (defaults to root)
   * @param shouldIncludeSubtrees - Whether to include nodes in subtrees
   * @returns Array of node contents
   */
  getTreeContentAt(
    nodeId?: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];

  /**
   * Gets the IDs of all nodes in the tree or subtree
   *
   * @param nodeId - The ID of the node
   * @returns Array of node IDs
   */
  getTreeNodeIdsAt(nodeId: string): string[];

  /**
   * Checks if the specified node is a branch (has children)
   *
   * @param nodeId - The ID of the node
   * @returns True if the node is a branch
   */
  isBranch(nodeId: string): boolean;

  /**
   * Checks if the specified node is a leaf (has no children)
   *
   * @param nodeId - The ID of the node
   * @returns True if the node is a leaf
   */
  isLeaf(nodeId: string): boolean;

  /**
   * Checks if the specified node is the root of the tree
   *
   * @param nodeId - The ID of the node
   * @returns True if the node is the root
   */
  isRoot(nodeId: string): boolean;

  /**
   * Checks if the specified node is a subtree
   *
   * @param nodeId - The ID of the node
   * @returns True if the node is a subtree
   */
  isSubtree(nodeId: string): boolean;

  /**
   * Moves a node to a new parent
   *
   * @param srcNodeId - The ID of the node to move
   * @param targetNodeId - The ID of the new parent
   * @returns Mapping from source node IDs to target node IDs
   */
  move(srcNodeId: string, targetNodeId: string): TFromToMap[];

  /**
   * Moves all children of a node to a new parent
   *
   * @param srcNodeId - The ID of the node whose children to move
   * @param targetNodeId - The ID of the new parent
   * @returns Mapping from source node IDs to target node IDs
   */
  moveChildren(srcNodeId: string, targetNodeId: string): TFromToMap[];

  /**
   * Replaces the content of a node
   *
   * @param nodeId - The ID of the node
   * @param nodeContent - The new content
   */
  replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;

  /**
   * Removes a node and its descendants
   *
   * @param nodeId - The ID of the node to remove
   */
  removeNodeAt(nodeId: string): void;

  /**
   * Converts the tree or subtree to a plain object
   *
   * @param nodeId - Optional ID of the node (defaults to root)
   * @returns Plain object representation of the tree
   */
  toPojoAt(nodeId?: string): TTreePojo<T>;

  /**
   * Visits all nodes in the tree or subtree
   *
   * @param visitor - The visitor to apply to each node
   * @param nodeId - Optional ID of the node to start from (defaults to root)
   * @param parentNodeId - Optional ID of the parent node
   */
  visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId?: string,
    parentNodeId?: string
  ): void;

  /**
   * Visits all leaf nodes in the tree or subtree
   *
   * @param visitor - The visitor to apply to each leaf node
   * @param nodeId - Optional ID of the node to start from (defaults to root)
   * @param parentNodeId - Optional ID of the parent node
   */
  visitLeavesOf(
    visitor: ITreeVisitor<T>,
    nodeId?: string,
    parentNodeId?: string
  ): void;
}

/**
 * Interface for an expression tree that extends the basic tree
 *
 * An expression tree is specialized for representing logical or mathematical expressions
 * with junction nodes (AND, OR, etc.) connecting operands.
 *
 * @template P - The type of node content in the expression tree
 */
interface IExpressionTree<P extends object> extends ITree<P> {
  /**
   * Appends a new node with a junction connecting it to the parent
   *
   * @param parentNodeId - The ID of the parent node
   * @param junctionContent - The content for the junction node
   * @param nodeContent - The content for the new node
   * @returns Object containing IDs of created nodes
   */
  appendContentWithJunction: (
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ) => IAppendChildNodeIds;

  /**
   * Creates a clone of the tree or subtree
   *
   * @param nodeId - The ID of the node to clone from
   * @returns A new expression tree
   */
  cloneAt(nodeId: string): IExpressionTree<P>;

  /**
   * Creates a subtree at the specified node
   *
   * @param nodeId - The ID of the node where the subtree will be created
   * @returns The created subtree
   */
  createSubtreeAt(nodeId: string): IExpressionTree<P>;

  /**
   * Creates a new instance of the expression tree
   *
   * @param rootSeed - Optional seed for the root node ID
   * @param nodeContent - Optional content for the root node
   * @returns A new expression tree
   */
  getNewInstance(rootSeed?: string, nodeContent?: P | null): IExpressionTree<P>;
}

/**
 * Interface for a directed graph that extends the basic tree
 *
 * A directed graph allows for more complex connections between nodes
 * than a simple tree.
 *
 * @template T - The type of node content in the graph
 */
interface IDirectedGraph<T extends object> extends ITree<T> {
  /**
   * Appends a child node with the provided content to a specified parent node
   *
   * @param treeParentId - The ID of the parent node
   * @param nodeContent - The content to be stored in the new node
   * @returns The ID of the newly created node
   */
  appendChildNodeWithContent: (
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ) => string;

  /**
   * Creates a clone of the graph or subgraph
   *
   * @param nodeId - The ID of the node to clone from
   * @returns A new directed graph
   */
  cloneAt(nodeId: string): IDirectedGraph<T>;

  /**
   * Creates a subgraph at the specified node
   *
   * @param nodeId - The ID of the node where the subgraph will be created
   * @returns The created subgraph
   */
  createSubtreeAt(nodeId: string): IDirectedGraph<T>;
}

export { IDirectedGraph, IExpressionTree, ITree, ITreeVisitor };
