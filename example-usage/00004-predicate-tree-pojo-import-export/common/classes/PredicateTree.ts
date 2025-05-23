/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import {
  AbstractExpressionTree,
  GenericExpressionTree,
  IExpressionTree,
  ITree,
  treeUtils,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  TFromToMap,
  AbstractTree,
} from "../../../../src";
import { NotTree } from "./NotTree";
import { ArithmeticTree } from "./ArithmeticTree";
import { TPredicateOperator } from "./types";

// Define the node content type for our predicate tree
export interface PredicateContent {
  operator?: TPredicateOperator;
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
   * Implementation of fromPojo following AbstractExpressionTree pattern
   * This uses the PredicateTree's createSubtreeOfTypeAt method for subtrees
   */
  static fromPojo(
    srcPojoTree: TTreePojo<PredicateContent>,
    transform: (
      nodeContent: TNodePojo<PredicateContent>
    ) => TGenericNodeContent<PredicateContent> = (
      nodeContent: TNodePojo<PredicateContent>
    ) => nodeContent.nodeContent
  ): PredicateTree {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = new PredicateTree(rootNodeId);
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    // Use our helper function to traverse and extract children
    PredicateTree.fromPojoTraverseAndExtractChildren(
      dTree._rootNodeId,
      rootNodeId,
      dTree,
      pojoObject,
      transform
    );

    if (Object.keys(pojoObject).length > 0) {
      throw new ValidationError(
        "Orphan nodes detected while parsing pojo object."
      );
    }

    return dTree;
  }

  /**
   * Helper method that follows AbstractExpressionTree.#fromPojoTraverseAndExtractChildren pattern
   * but uses PredicateTree's createSubtreeOfTypeAt for subtrees
   */
  static fromPojoTraverseAndExtractChildren<T extends PredicateContent>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>,
    fromToMap: TFromToMap[] = []
  ): TFromToMap[] {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(
      jsonParentId,
      treeObject
    ) as TTreePojo<T>;

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (
        nodePojo.nodeType &&
        nodePojo.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName + ":")
      ) {
        // Create the appropriate subtree type using our createSubtreeOfTypeAt
        const subtree = dTree.createSubtreeOfTypeAt(
          treeParentId,
          nodePojo.nodeType
        );
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));

        // Continue processing children of this subtree
        PredicateTree.fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as IExpressionTree<T>,
          treeObject,
          transformer,
          fromToMap
        );
      } else {
        // Regular node
        const childId = (dTree as any).fromPojoAppendChildNodeWithContent
          ? (dTree as any).fromPojoAppendChildNodeWithContent(
              treeParentId,
              transformer(nodePojo)
            )
          : dTree.appendChildNodeWithContent(
              treeParentId,
              transformer(nodePojo)
            );

        fromToMap.push({ from: nodeId, to: childId });

        // Process children of this node
        PredicateTree.fromPojoTraverseAndExtractChildren(
          childId,
          nodeId,
          dTree,
          treeObject,
          transformer,
          fromToMap
        );
      }
    });
    return fromToMap;
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
  createSubtreeNotTree(targetNodeId: string): NotTree {
    const constructorFn = () => {
      const NotTree = getNotTreeClass();
      return new NotTree() as IExpressionTree<PredicateContent>;
    };

    return this._createSubtreeAt<PredicateContent>(
      targetNodeId,
      constructorFn
    ) as NotTree;
  }

  /**
   * Create an ArithmeticTree subtree at the specified node
   * This implementation creates an ArithmeticTree instance and attaches it as a subtree
   * to the parent tree at the specified node.
   * @param targetNodeId The node ID where to create the ArithmeticTree subtree
   * @returns The created ArithmeticTree subtree
   */
  createSubtreeArithmeticTree(targetNodeId: string): ArithmeticTree {
    const constructorFn = () => {
      const ArithmeticTree = getArithmeticTreeClass();
      return new ArithmeticTree() as IExpressionTree<PredicateContent>;
    };

    return this._createSubtreeAt<PredicateContent>(
      targetNodeId,
      constructorFn
    ) as ArithmeticTree;
  }
}

// Export the fromPojo function for standalone use
export const fromPojo = PredicateTree.fromPojo;
