/**
 * ArithmeticTree Implementation
 *
 * A specialized implementation of GenericExpressionTree for arithmetic operations
 */

import {
  AbstractExpressionTree,
  GenericExpressionTree,
  IExpressionTree,
} from "../../../../src";
import treeUtils from "../../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../../src/DirectedGraph/types";
import { AbstractTree } from "../../../../dist";

// Define the node content type for our arithmetic tree
export interface ArithmeticContent {
  subjectId?: string;
  value?: number | string;
  subjectLabel?: string;
  operator?: string; // $add, $subtract, $multiply, $divide
  [key: string]: any; // Allow additional properties
}

// Define the POJO node type
export interface ArithmeticPojoNode {
  parentId: string | null;
  nodeContent: ArithmeticContent;
  nodeType?: string;
}

// Define the POJO document type
export interface ArithmeticPojoDocs {
  [key: string]: ArithmeticPojoNode;
}

/**
 * Error class for our arithmetic tree
 */
export class ArithmeticTreeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArithmeticTreeError";
  }
}

/**
 * ArithmeticTree - A tree that handles arithmetic expressions
 * and supports POJO import/export
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class ArithmeticTree extends GenericExpressionTree<ArithmeticContent> {
  static SubtreeNodeTypeName: string = "ArithmeticTree";
  public SubtreeNodeTypeName: string = "ArithmeticTree";

  /**
   * Create a new ArithmeticTree
   */
  constructor(rootNodeId?: string, nodeContent?: ArithmeticContent) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$add", // Default to addition
        subjectLabel: "Sum",
      });
    }
  }

  /**
   * Evaluate the arithmetic expression represented by the tree
   * @param nodeId Optional ID of the node to evaluate (defaults to root)
   * @returns The calculated result
   */
  evaluate(nodeId: string = this.rootNodeId): number {
    const nodeContent = this.getChildContentAt(nodeId) as ArithmeticContent;

    // If this is a leaf node with a value, return the value
    if (this.isLeaf(nodeId) && nodeContent.value !== undefined) {
      return Number(nodeContent.value);
    }

    // Get all children
    const childrenIds = this.getChildrenNodeIdsOf(nodeId);

    // No children to evaluate
    if (childrenIds.length === 0) {
      if (nodeContent.value !== undefined) {
        return Number(nodeContent.value);
      }
      throw new ArithmeticTreeError(
        `Node ${nodeId} has no children and no value to evaluate`
      );
    }

    // Evaluate based on operator
    const operator = nodeContent.operator || "$add"; // Default to addition

    // Calculate based on the operator
    switch (operator) {
      case "$add": {
        return childrenIds.reduce(
          (sum, childId) => sum + this.evaluate(childId),
          0
        );
      }
      case "$subtract": {
        // First child minus all other children
        if (childrenIds.length === 0) return 0;

        const firstValue = this.evaluate(childrenIds[0]);
        if (childrenIds.length === 1) return firstValue;

        return childrenIds
          .slice(1)
          .reduce(
            (result, childId) => result - this.evaluate(childId),
            firstValue
          );
      }
      case "$multiply": {
        return childrenIds.reduce(
          (product, childId) => product * this.evaluate(childId),
          1
        );
      }
      case "$divide": {
        // First child divided by all other children
        if (childrenIds.length === 0) return 0;

        const firstValue = this.evaluate(childrenIds[0]);
        if (childrenIds.length === 1) return firstValue;

        return childrenIds.slice(1).reduce((result, childId) => {
          const divisor = this.evaluate(childId);
          if (divisor === 0) {
            throw new ArithmeticTreeError("Division by zero");
          }
          return result / divisor;
        }, firstValue);
      }
      default:
        throw new ArithmeticTreeError(`Unknown operator: ${operator}`);
    }
  }

  /**
   * Convert the result to a human-readable string
   * @param nodeId Optional ID of the node to evaluate (defaults to root)
   * @returns A string representation of the expression and its result
   */
  toString(nodeId: string = this.rootNodeId): string {
    try {
      const result = this.evaluate(nodeId);
      const nodeContent = this.getChildContentAt(nodeId) as ArithmeticContent;
      const label = nodeContent.subjectLabel || "Result";

      return `${label}: ${result}`;
    } catch (error) {
      if (error instanceof ArithmeticTreeError) {
        return `Error: ${error.message}`;
      }
      throw error;
    }
  }

  static fromPojo<P extends ArithmeticContent>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): ArithmeticTree {
    const genericTree = AbstractExpressionTree.fromPojo(srcPojoTree, transform);

    const arithmeticTree = new ArithmeticTree();

    // @ts-ignore  - Duck Punch ArithmeticTree
    arithmeticTree._incrementor = genericTree._incrementor;
    // @ts-ignore  - Duck Punch ArithmeticTree
    arithmeticTree._rootNodeId = genericTree._rootNodeId;
    // @ts-ignore  - Duck Punch ArithmeticTree
    arithmeticTree._nodeDictionary = genericTree._nodeDictionary;

    return arithmeticTree;
  }

  /**
   * Create an ArithmeticTree from a POJO
   * @param srcPojoTree The source POJO tree
   * @param transform Optional transform function
   * @returns A new ArithmeticTree
   */
  static x_fromPojo<P extends ArithmeticContent>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): ArithmeticTree {
    // Find the root node using the utility function
    const rootKey = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);

    // Create a new tree with the root node content
    const tree = new ArithmeticTree(
      rootKey,
      srcPojoTree[rootKey].nodeContent as ArithmeticContent
    );

    // Use a copy of the POJO tree to avoid modifying the original
    const workingPojo = { ...srcPojoTree };

    // Remove the root node since we've already processed it
    delete workingPojo[rootKey];

    // Create a mapping of nodeId to subtree instances
    // This helps us keep track of all subtrees we create
    const subtreeMap = new Map<string, IExpressionTree<ArithmeticContent>>();
    subtreeMap.set(rootKey, tree);

    // Process all nodes, ensuring we maintain the exact node IDs from the POJO
    const processNodes = (parentId: string) => {
      // Extract all children of the parent (this modifies workingPojo)
      const childrenNodes = treeUtils.extractChildrenNodes(
        parentId,
        workingPojo
      );

      // Process each child
      Object.entries(childrenNodes).forEach(([childId, node]) => {
        // Get the parent subtree (either the main tree or a previously created subtree)
        const parentTree = subtreeMap.get(parentId);
        if (!parentTree) {
          throw new ArithmeticTreeError(
            `Parent tree for ${parentId} not found`
          );
        }

        if (
          node.nodeType &&
          node.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName)
        ) {
          // For subtree nodes, create a subtree
          // We need to use the exact childId as the node ID
          const exactIdParts = childId.split(":");
          const nodeIdInParent = exactIdParts[exactIdParts.length - 1];

          // Create an subtree at the parent with this exact ID
          const subtree = parentTree.createSubtreeAt(
            parentId
          ) as ArithmeticTree;

          // Set the content
          subtree.replaceNodeContent(
            subtree.rootNodeId,
            node.nodeContent as ArithmeticContent
          );

          // Add to our map for future lookups
          subtreeMap.set(childId, subtree);

          // Continue processing this subtree's children
          processNodes(childId);
        } else {
          // For regular nodes, attach them with the exact childId
          // Extract the last part of the node ID (e.g., "7" from "parent:7")
          const exactIdParts = childId.split(":");
          const nodeIdInParent = exactIdParts[exactIdParts.length - 1];

          // Append with exact ID
          const newNodeId = parentTree.appendChildNodeWithContent(
            parentId,
            node.nodeContent as ArithmeticContent
          );

          // Process any children of this node
          processNodes(childId);
        }
      });
    };

    // Start processing from the root
    processNodes(rootKey);

    // Check for orphan nodes (any node left in workingPojo after processing)
    if (Object.keys(workingPojo).length > 0) {
      throw new ArithmeticTreeError(
        `Orphan nodes detected: ${Object.keys(workingPojo).join(", ")}`
      );
    }

    return tree;
  }

  /**
   * Create an arithmetic expression tree from values
   * @param operator The operator to use ($add, $subtract, $multiply, $divide)
   * @param values The values to use in the calculation
   * @param label Optional label for the operation
   * @returns A new ArithmeticTree
   */
  static createExpression(
    operator: string,
    values: number[],
    label?: string
  ): ArithmeticTree {
    if (!["$add", "$subtract", "$multiply", "$divide"].includes(operator)) {
      throw new ArithmeticTreeError(`Invalid operator: ${operator}`);
    }

    const tree = new ArithmeticTree(undefined, {
      operator,
      subjectLabel: label || ArithmeticTree.getDefaultLabel(operator),
    });

    // Add each value as a child node
    values.forEach((value, index) => {
      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value,
        subjectLabel: `Value ${index + 1}`,
      });
    });

    return tree;
  }

  /**
   * Get a default label for an operation
   * @param operator The operator
   * @returns A human-readable label
   */
  private static getDefaultLabel(operator: string): string {
    switch (operator) {
      case "$add":
        return "Sum";
      case "$subtract":
        return "Difference";
      case "$multiply":
        return "Product";
      case "$divide":
        return "Quotient";
      default:
        return "Result";
    }
  }

  /**
   *
   * Cursor/Coposer - Fuck Up.  Left here to remind it - not to do this again.
   *
   * Convert the tree to a POJO document
   * @param nodeId Optional ID of the node to start from (defaults to root)
   * @returns The POJO document representing the tree
   */
  x_toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Get the base POJO from the parent method
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Find the root node key
    const pojoRootKey = treeUtils.parseUniquePojoRootKeyOrThrow(pojo);

    // Set proper nodeType if this is used as a subtree
    pojo[pojoRootKey].nodeType = "subtree:ArithmeticTree";

    // Identify all operation nodes that might need to be marked as subtrees
    Object.entries(pojo).forEach(([key, node]: [string, any]) => {
      // Skip the root node, we already set its type
      if (key === pojoRootKey) return;

      // Check if this is an operation node
      if (
        node.nodeContent &&
        node.nodeContent.operator &&
        ["$add", "$subtract", "$multiply", "$divide"].includes(
          node.nodeContent.operator
        )
      ) {
        // Check if this node has children (making it a subtree)
        const hasChildren = Object.values(pojo).some(
          (otherNode: any) => otherNode.parentId === key
        );

        if (hasChildren) {
          // Mark operation nodes with children as ArithmeticTree subtrees
          node.nodeType = "subtree:ArithmeticTree";
        }
      }
    });

    return pojo;
  }
}

// Export a factory function for standalone use
export const createArithmeticTree = (
  operator: string,
  values: number[],
  label?: string
): ArithmeticTree => {
  return ArithmeticTree.createExpression(operator, values, label);
};
