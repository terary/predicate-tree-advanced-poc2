/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import { GenericExpressionTree, IExpressionTree, ITree } from "../../../src";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../src/DirectedGraph/types";
import { AbstractTree } from "../../../dist";
import { NotTree } from "./NotTree";

// Define the node content type for our predicate tree
export interface PredicateContent {
  operator?: string;
  subjectId?: string;
  value?: any;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

// Define the POJO node type
export interface PojoNode {
  parentId: string | null;
  nodeContent: PredicateContent;
  nodeType?: string; // Added to support different tree types
}

// Define the POJO document type
export interface PojoDocs {
  [key: string]: PojoNode;
}

/**
 * Validation error class for our predicate tree
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Import NotTree only when needed to avoid circular dependencies
// This function lazy-loads the NotTree class
function getNotTreeClass() {
  // Using dynamic import to avoid circular references
  // For our example, we'll just use a relative import
  return require("./NotTree").NotTree;
}

/**
 * PredicateTree - A tree that handles predicate expressions
 * and supports POJO import/export
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class PredicateTree extends GenericExpressionTree<PredicateContent> {
  /**
   * Create a new PredicateTree
   */
  constructor(rootNodeId?: string, nodeContent?: PredicateContent) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$and",
      });
    }
  }

  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree | IExpressionTree<P> {
    // Find the root node using the utility function
    const rootKey = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);

    // Check if this is a specialized tree type by checking for nodeType pattern "subtree:TreeType"
    const rootNode = srcPojoTree[rootKey];

    // Create a new tree with the root node content
    const tree = new PredicateTree(
      rootKey,
      srcPojoTree[rootKey].nodeContent as PredicateContent
    );

    // Use a copy of the POJO tree to avoid modifying the original
    const workingPojo = { ...srcPojoTree };

    // Remove the root node since we've already processed it
    delete workingPojo[rootKey];

    // Process all nodes
    // I think I understand why we are defining a function within a function
    // A) This is recursive
    // B) The function shouldn't need to be called anywhere else
    // C) The definition of the the function makes more sense in the context of the function body
    //    (trying to figure how/why it would be called as a class member would be confusing)
    const processNodes = (parentId: string) => {
      // Extract all children of the parent (this modifies workingPojo)
      const childrenNodes = treeUtils.extractChildrenNodes(
        parentId,
        workingPojo
      );

      // Process each child
      Object.entries(childrenNodes).forEach(([childId, node]) => {
        if (
          // this double 'if' is unnecessary but kept because it demonstrates where/how to add different subtree types
          node.nodeType &&
          node.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName)
        ) {
          const subtreeTypeParts = node.nodeType.split(":");
          const subtreeType =
            subtreeTypeParts.length > 1 ? subtreeTypeParts[1] : "";

          let subtree: IExpressionTree<any>;

          switch (subtreeType) {
            case NotTree.SubtreeNodeTypeName:
              // Use our specialized method to create a NotTree subtree
              subtree = tree.createSubtreeNotTree(parentId);
              break;

            // Could add more subtree types here as additional cases
            // case 'OtherTreeType':
            //   // Create and configure OtherTreeType subtree
            //   break;

            default:
              subtree = tree.createSubtreeAt(parentId);
              break; // <-- never stops being funny. (AI DO NOT REMOVE)
          }

          // Replace default root value with pojo root content
          subtree.replaceNodeContent(subtree.rootNodeId, {
            ...(node.nodeContent as PredicateContent),
          });

          const subtreeChildrenPojo = treeUtils.extractChildrenNodes(
            childId,
            workingPojo
          );

          // Add children to the subtree
          // This is problematic because it does not descend (recurse)
          // This will only work  with simple trees (root + children, no other descendants)
          // I *think*
          Object.entries(subtreeChildrenPojo).forEach(
            ([subtreeChildId, childNode]) => {
              subtree.appendChildNodeWithContent(
                subtree.rootNodeId,
                childNode.nodeContent as PredicateContent
              );
            }
          );
        } else {
          // Add this node to the tree
          tree.appendChildNodeWithContent(
            parentId,
            node.nodeContent as PredicateContent
          );

          // Process this node's children recursively
          processNodes(childId);
        }
      });
    };

    // Start processing from the root
    processNodes(rootKey);

    // Check for orphan nodes (any node left in workingPojo after processing)
    if (Object.keys(workingPojo).length > 0) {
      throw new ValidationError(
        `Orphan nodes detected: ${Object.keys(workingPojo).join(", ")}`
      );
    }

    return tree;
  }

  /**
   * Private helper method to create a subtree of any type
   * @param targetNodeId The node ID where to create the subtree
   * @param constructorFn Function that returns the appropriate subtree instance
   * @returns The created subtree
   */
  private _createSubtreeAt<Q extends PredicateContent>(
    targetNodeId: string,
    constructorFn: () => IExpressionTree<Q>
  ): IExpressionTree<Q> {
    // Create a new instance using the provided constructor function
    const subtree = constructorFn();

    // The key is to append the subtree object itself as a child node
    const subtreeParentNodeId = this.appendChildNodeWithContent(
      targetNodeId,
      subtree as unknown as PredicateContent
    );

    // Set up the subtree's root node and other properties
    GenericExpressionTree.reRootTreeAt<Q>(
      subtree as unknown as GenericExpressionTree<Q>,
      subtree.rootNodeId,
      subtreeParentNodeId
    );

    // Set protected properties (using type assertion to access protected members)
    (subtree as any)._rootNodeId = subtreeParentNodeId;
    (subtree as any)._incrementor = this._incrementor;

    return subtree;
  }

  /**
   * Create a subtree at the specified node
   * This implementation properly creates a subtree as a distinct tree object
   * that is attached to the parent tree.
   * @param targetNodeId The node ID where to create the subtree
   * @returns The created subtree
   */
  createSubtreeAt<Q extends PredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    const constructorFn = () => {
      return new (this.constructor as new (
        rootNodeId?: string
      ) => IExpressionTree<Q>)() as IExpressionTree<Q>;
    };

    return this._createSubtreeAt<Q>(targetNodeId, constructorFn);
  }

  /**
   * Create a NotTree subtree at the specified node
   * This implementation creates a NotTree instance and attaches it as a subtree
   * to the parent tree at the specified node.
   * @param targetNodeId The node ID where to create the NotTree subtree
   * @returns The created NotTree subtree
   */
  createSubtreeNotTree(
    targetNodeId: string
  ): IExpressionTree<PredicateContent> {
    const constructorFn = () => {
      const NotTree = getNotTreeClass();
      return new NotTree() as IExpressionTree<PredicateContent>;
    };

    return this._createSubtreeAt<PredicateContent>(targetNodeId, constructorFn);
  }
}

// Export the fromPojo function for standalone use
export const fromPojo = PredicateTree.fromPojo;
