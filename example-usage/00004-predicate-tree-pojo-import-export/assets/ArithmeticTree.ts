/**
 * ArithmeticTree Implementation
 *
 * A specialized implementation of GenericExpressionTree for arithmetic operations
 */

import { GenericExpressionTree, IExpressionTree } from "../../../src";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../src/DirectedGraph/types";
import { AbstractTree } from "../../../dist";

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

  /**
   * Create an ArithmeticTree from a POJO
   * @param srcPojoTree The source POJO tree
   * @param transform Optional transform function
   * @returns A new ArithmeticTree
   */
  static fromPojo<P extends ArithmeticContent>(
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
          // Handle subtrees if needed in the future
          console.warn("Subtrees not currently supported in ArithmeticTree");
        } else {
          // Add this node to the tree
          tree.appendChildNodeWithContent(
            parentId,
            node.nodeContent as ArithmeticContent
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
   * Convert the tree to a POJO document
   * @param nodeId Optional ID of the node to start from (defaults to root)
   * @returns The POJO document representing the tree
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Get the base POJO from the parent method
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Set proper nodeType if this is used as a subtree
    const pojoRootKey = treeUtils.parseUniquePojoRootKeyOrThrow(pojo);
    pojo[pojoRootKey].nodeType = "subtree:ArithmeticTree";

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
