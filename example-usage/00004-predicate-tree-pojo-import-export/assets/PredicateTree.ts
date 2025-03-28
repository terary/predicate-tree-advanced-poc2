/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import { GenericExpressionTree, IExpressionTree, ITree } from "../../../src";
import { AbstractExpressionTree } from "../../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../src/DirectedGraph/types";
import { AbstractTree } from "../../../dist";
import { NotTree } from "./NotTree";
import { ArithmeticTree } from "./ArithmeticTree";

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

// Function to lazy-load the ArithmeticTree class
function getArithmeticTreeClass() {
  return require("./ArithmeticTree").ArithmeticTree;
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

  /**
   * Create an appropriate subtree type based on the nodeType
   * @param targetNodeId The node ID where to create the subtree
   * @param nodeType The type of subtree to create (e.g., "subtree:NotTree", "subtree:ArithmeticTree")
   * @returns The created subtree of the appropriate type
   */
  createSubtreeOfTypeAt<Q extends PredicateContent>(
    targetNodeId: string,
    nodeType: string
  ): IExpressionTree<Q> {
    if (!nodeType.startsWith(AbstractTree.SubtreeNodeTypeName)) {
      return this.createSubtreeAt<Q>(targetNodeId);
    }

    // Extract the subtree type from the nodeType string (e.g., "subtree:NotTree" -> "NotTree")
    const subtreeTypeParts = nodeType.split(":");
    const subtreeType = subtreeTypeParts.length > 1 ? subtreeTypeParts[1] : "";

    // Need to cast the return type to match the generic parameter
    // This is safe because all our subtree types extend PredicateContent
    switch (subtreeType) {
      case NotTree.SubtreeNodeTypeName:
      case "NotTree": // For backward compatibility
        return this.createSubtreeNotTree(
          targetNodeId
        ) as unknown as IExpressionTree<Q>;

      case ArithmeticTree.SubtreeNodeTypeName:
      case "ArithmeticTree": // For backward compatibility
        return this.createSubtreeArithmeticTree(
          targetNodeId
        ) as unknown as IExpressionTree<Q>;

      default:
        return this.createSubtreeAt<Q>(targetNodeId);
    }
  }

  /**
   * Override the static fromPojo method to create appropriate subtrees
   */
  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree {
    // Find the root node
    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);
    const rootNodePojo = srcPojoTree[rootNodeId];

    // Create a new PredicateTree instance
    const dTree = new PredicateTree(rootNodeId);

    // Set the root node content
    const transformer =
      transform || ((nodeContent: TNodePojo<P>) => nodeContent.nodeContent);
    dTree.replaceNodeContent(dTree.rootNodeId, transformer(rootNodePojo));

    // Use a copy of the POJO tree to avoid modifying the original
    const workingPojo = { ...srcPojoTree };

    // Remove the root node since we've already processed it
    delete workingPojo[rootNodeId];

    // Process all nodes
    const processNodes = (parentId: string) => {
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
          const subtree = dTree.createSubtreeOfTypeAt(parentId, node.nodeType);

          // Set content
          subtree.replaceNodeContent(
            subtree.rootNodeId,
            transformer(node as TNodePojo<P>)
          );

          // Process this subtree's children recursively
          processNodes(childId);
        } else {
          // Add this node to the tree
          dTree.appendChildNodeWithContent(
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
      throw new ValidationError(
        `Orphan nodes detected: ${Object.keys(workingPojo).join(", ")}`
      );
    }

    return dTree;
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

  /**
   * Create an ArithmeticTree subtree at the specified node
   * This implementation creates an ArithmeticTree instance and attaches it as a subtree
   * to the parent tree at the specified node.
   * @param targetNodeId The node ID where to create the ArithmeticTree subtree
   * @returns The created ArithmeticTree subtree
   */
  createSubtreeArithmeticTree(
    targetNodeId: string
  ): IExpressionTree<PredicateContent> {
    const constructorFn = () => {
      const ArithmeticTree = getArithmeticTreeClass();
      return new ArithmeticTree() as IExpressionTree<PredicateContent>;
    };

    return this._createSubtreeAt<PredicateContent>(targetNodeId, constructorFn);
  }
}

// Export the fromPojo function for standalone use
export const fromPojo = PredicateTree.fromPojo;
